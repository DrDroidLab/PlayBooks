import json
import logging
from datetime import timezone
from typing import Union

import traceback

import uuid
from django.conf import settings
from django.db.models import QuerySet
from django.http import HttpResponse, HttpRequest, JsonResponse
from google.protobuf.struct_pb2 import Struct

from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from accounts.models import Account, get_request_account, get_request_user, AccountApiToken
from executor.workflows.crud.workflow_execution_crud import get_db_workflow_executions
from executor.workflows.crud.workflow_execution_utils import create_workflow_execution_util
from executor.workflows.crud.workflows_crud import update_or_create_db_workflow, get_db_workflows
from executor.workflows.crud.workflows_update_processor import workflows_update_processor
from executor.workflows.tasks import test_workflow_notification, test_workflow_transformer
from playbooks.utils.decorators import web_api, account_post_api, account_get_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.playbooks.source_task_definitions.lambda_function_task_pb2 import Lambda
from utils.proto_utils import proto_to_dict, dict_to_proto
from utils.time_utils import current_datetime
from protos.base_pb2 import Meta, Message, Page
from protos.playbooks.api_pb2 import GetWorkflowsRequest, GetWorkflowsResponse, CreateWorkflowRequest, \
    CreateWorkflowResponse, UpdateWorkflowRequest, UpdateWorkflowResponse, ExecuteWorkflowRequest, \
    ExecuteWorkflowResponse, ExecutionWorkflowGetResponse, ExecutionsWorkflowsListResponse, \
    ExecutionsWorkflowsListRequest, ExecutionWorkflowGetRequest, ExecutionsWorkflowsGetAllRequest, \
    ExecutionsWorkflowsGetAllResponse, TestWorkflowTransformerRequest, TestWorkflowTransformerResponse
from protos.playbooks.workflow_pb2 import Workflow, WorkflowConfiguration, WorkflowExecutionStatusType
from utils.uri_utils import construct_curl, build_absolute_uri

logger = logging.getLogger(__name__)


@web_api(GetWorkflowsRequest)
def workflows_get(request_message: GetWorkflowsRequest) -> Union[GetWorkflowsResponse, HttpResponse]:
    account: Account = get_request_account()
    meta: Meta = request_message.meta
    show_inactive = meta.show_inactive
    page: Page = meta.page
    list_all = True

    qs: QuerySet = account.workflow_set.all()
    if request_message.workflow_ids:
        qs = qs.filter(id__in=request_message.workflow_ids)
        list_all = False
    elif not show_inactive or not show_inactive.value:
        qs = qs.filter(is_active=True)

    total_count = qs.count()
    qs = qs.order_by('-created_at')
    qs = filter_page(qs, page)

    if not list_all:
        workflow_list = list(wf.proto for wf in qs)
    else:
        workflow_list = list(wf.proto_partial for wf in qs)

    return GetWorkflowsResponse(meta=get_meta(page=page, total_count=total_count), workflows=workflow_list)


@web_api(CreateWorkflowRequest)
def workflows_create(request_message: CreateWorkflowRequest) -> Union[CreateWorkflowResponse, HttpResponse]:
    account: Account = get_request_account()
    user = get_request_user()
    workflow: Workflow = request_message.workflow
    if not workflow or not workflow.name:
        return CreateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request", description="Missing name/workflow"))
    workflow, error = update_or_create_db_workflow(account, user.email, workflow)
    if error:
        return CreateWorkflowResponse(success=BoolValue(value=False), message=Message(title="Error", description=error))
    return CreateWorkflowResponse(success=BoolValue(value=True), workflow=workflow.proto)


@web_api(UpdateWorkflowRequest)
def workflows_update(request_message: UpdateWorkflowRequest) -> Union[UpdateWorkflowResponse, HttpResponse]:
    account: Account = get_request_account()
    user = get_request_user()
    workflow_id = request_message.workflow_id.value
    update_workflow_ops = request_message.update_workflow_ops
    if not workflow_id or not update_workflow_ops:
        return UpdateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request", description="Missing workflow_id/ops"))
    try:
        account_workflow = account.workflow_set.get(id=workflow_id)
    except Exception as e:
        logger.error(f"Error fetching workflow: {e}")
        return UpdateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Error", description=str(e)))
    if account_workflow.created_by != user.email:
        return UpdateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Error", description="Unauthorized"))
    try:
        workflows_update_processor.update(account_workflow, update_workflow_ops)
    except Exception as e:
        logger.error(f"Error updating playbook: {e}")
        return UpdateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Error", description=str(e)))
    return UpdateWorkflowResponse(success=BoolValue(value=True))


@web_api(ExecuteWorkflowRequest)
def workflows_execute(request_message: ExecuteWorkflowRequest) -> Union[ExecuteWorkflowResponse, HttpResponse]:
    account: Account = get_request_account()
    user = get_request_user()
    current_time_utc = current_datetime()
    workflow_id = request_message.workflow_id.value
    if not workflow_id:
        return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                       message=Message(title="Invalid Request", description="Missing workflow_id"))
    try:
        account_workflow = account.workflow_set.get(id=workflow_id)
    except Exception as e:
        logger.error(f"Error fetching workflow: {e}")
        return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                       message=Message(title="Error", description=str(e)))
    try:
        uuid_str = uuid.uuid4().hex
        workflow_run_uuid = f'{str(int(current_time_utc.timestamp()))}_{account.id}_{account_workflow.id}_wf_run_{uuid_str}'
        workflow: Workflow = account_workflow.proto_partial

        workflow_config = proto_to_dict(workflow.configuration)
        requested_config = proto_to_dict(request_message.workflow_configuration)
        if requested_config:
            for key, value in requested_config.items():
                if key == 'global_variable_set':
                    global_variable_set = workflow_config['global_variable_set']
                    for k, v in value.items():
                        global_variable_set[k] = v
                else:
                    workflow_config[key] = value

        workflow_config_proto = dict_to_proto(workflow_config, WorkflowConfiguration)
        workflow.configuration.CopyFrom(workflow_config_proto)

        execution_scheduled, err = create_workflow_execution_util(account, workflow, current_time_utc,
                                                                  workflow_run_uuid, user.email, None)
        if err:
            return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                           message=Message(title="Failed to Schedule Workflow Execution",
                                                           description=f"Error: {err}"))
        return ExecuteWorkflowResponse(success=BoolValue(value=True),
                                       workflow_run_id=StringValue(value=workflow_run_uuid))
    except Exception as e:
        logger.error(f"Error updating playbook: {e}")
        return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                       message=Message(title="Error", description=str(e)))


@web_api(ExecutionsWorkflowsListRequest)
def workflows_execution_list(request_message: ExecutionsWorkflowsListRequest) -> \
        Union[ExecutionsWorkflowsListResponse, HttpResponse]:
    account: Account = get_request_account()
    meta: Meta = request_message.meta
    page: Page = meta.page
    workflow_ids = request_message.workflow_ids
    try:
        workflow_executions = get_db_workflow_executions(account, workflow_ids=workflow_ids)
        if not workflow_executions:
            return ExecutionsWorkflowsListResponse(success=BoolValue(value=True),
                                                   message=Message(title="No Workflow Executions Found"))
        distinct_workflow_executions = workflow_executions.distinct('workflow_run_id')
        total_count = distinct_workflow_executions.count()
        distinct_workflow_executions = filter_page(distinct_workflow_executions, page)

        we_protos = []
        for weqs in distinct_workflow_executions:
            we = weqs.workflow_run_id
            current_workflow_executions = workflow_executions.filter(workflow_run_id=we)
            last_completed_cwe = current_workflow_executions.first()
            started_at = last_completed_cwe.started_at
            next_scheduled_cwe = None
            for cwe in current_workflow_executions:
                if cwe.status in [WorkflowExecutionStatusType.WORKFLOW_FINISHED,
                                  WorkflowExecutionStatusType.WORKFLOW_FAILED]:
                    last_completed_cwe = cwe
                if cwe.status == WorkflowExecutionStatusType.WORKFLOW_SCHEDULED:
                    next_scheduled_cwe = cwe
                    break
            last_completed_cwe_proto = last_completed_cwe.proto_partial
            last_completed_cwe_proto.started_at = int(
                started_at.replace(tzinfo=timezone.utc).timestamp()) if started_at else 0
            if next_scheduled_cwe:
                last_completed_cwe_proto.scheduled_at = int(
                    next_scheduled_cwe.scheduled_at.replace(tzinfo=timezone.utc).timestamp())
            we_protos.append(last_completed_cwe_proto)

        return ExecutionsWorkflowsListResponse(meta=get_meta(page=page, total_count=total_count),
                                               success=BoolValue(value=True), workflow_executions=we_protos)
    except Exception as e:
        return ExecutionsWorkflowsListResponse(success=BoolValue(value=False),
                                               message=Message(title="Error", description=str(e)))


@web_api(ExecutionsWorkflowsGetAllRequest)
def workflows_execution_get_all(request_message: ExecutionsWorkflowsGetAllRequest) -> \
        Union[ExecutionsWorkflowsGetAllResponse, HttpResponse]:
    account: Account = get_request_account()
    workflow_run_id = request_message.workflow_run_id.value
    if not workflow_run_id:
        return ExecutionsWorkflowsGetAllResponse(success=BoolValue(value=False),
                                                 message=Message(title="Invalid Request",
                                                                 description="Missing workflow_run_id"))
    try:
        workflow_execution = get_db_workflow_executions(account, workflow_run_id=workflow_run_id)
        if not workflow_execution:
            return ExecutionsWorkflowsGetAllResponse(success=BoolValue(value=False), message=Message(title="Error",
                                                                                                     description="Workflow Executions not found"))
    except Exception as e:
        return ExecutionsWorkflowsGetAllResponse(success=BoolValue(value=False),
                                                 message=Message(title="Error", description=str(e)))

    we_protos = [we.proto for we in workflow_execution]
    return ExecutionsWorkflowsGetAllResponse(success=BoolValue(value=True), workflow_executions=we_protos)


@web_api(ExecutionWorkflowGetRequest)
def workflows_execution_get(request_message: ExecutionWorkflowGetRequest) -> \
        Union[ExecutionWorkflowGetResponse, HttpResponse]:
    account: Account = get_request_account()
    workflow_execution_id = request_message.workflow_execution_id.value
    if not workflow_execution_id:
        return ExecutionWorkflowGetResponse(success=BoolValue(value=False), message=Message(title="Invalid Request",
                                                                                            description="Missing workflow_execution_id"))
    try:
        workflow_execution = get_db_workflow_executions(account, workflow_execution_id=workflow_execution_id)
        if not workflow_execution:
            return ExecutionWorkflowGetResponse(success=BoolValue(value=False), message=Message(title="Error",
                                                                                                description="Workflow Execution not found"))
    except Exception as e:
        return ExecutionWorkflowGetResponse(success=BoolValue(value=False),
                                            message=Message(title="Error", description=str(e)))

    workflow_execution = workflow_execution.first()
    workflow_execution_protos = workflow_execution.proto
    return ExecutionWorkflowGetResponse(success=BoolValue(value=True), workflow_execution=workflow_execution_protos)


@account_post_api(ExecuteWorkflowRequest)
def workflows_api_execute(request_message: ExecuteWorkflowRequest) -> HttpResponse:
    account: Account = get_request_account()
    user = get_request_user()
    current_time_utc = current_datetime()
    workflow_id = request_message.workflow_id.value
    workflow_name = request_message.workflow_name.value
    if not workflow_id and not workflow_name:
        return HttpResponse(json.dumps({'success': False, 'error_message': 'Request Workflow params not found.'}),
                            status=400, content_type='application/json', )
    try:
        account_workflows = None
        if workflow_id:
            account_workflows = get_db_workflows(account, workflow_id=workflow_id)
        elif workflow_name:
            account_workflows = get_db_workflows(account, workflow_name=workflow_name)
        if not account_workflows:
            return HttpResponse(json.dumps({'success': False, 'error_message': 'Workflow not found'}), status=404,
                                content_type='application/json')
        account_workflow = account_workflows.first()
    except Exception as e:
        logger.error(f"Error fetching workflow: {str(e)}")
        return HttpResponse(json.dumps({'success': False, 'error_message': 'An internal error has occurred!'}),
                            status=500,
                            content_type='application/json')
    try:
        uuid_str = uuid.uuid4().hex
        workflow_run_uuid = f'{str(int(current_time_utc.timestamp()))}_{account.id}_{account_workflow.id}_wf_run_{uuid_str}'
        workflow: Workflow = account_workflow.proto_partial
        workflow_config = proto_to_dict(workflow.configuration)

        requested_config = proto_to_dict(request_message.workflow_configuration)
        if requested_config:
            for key, value in requested_config.items():
                if key == 'global_variable_set':
                    global_variable_set = workflow_config['global_variable_set']
                    for k, v in value.items():
                        global_variable_set[k] = v
                else:
                    workflow_config[key] = value

        workflow_config_proto = dict_to_proto(workflow_config, WorkflowConfiguration)
        workflow.configuration.CopyFrom(workflow_config_proto)

        execution_scheduled, err = create_workflow_execution_util(account, workflow, current_time_utc,
                                                                  workflow_run_uuid, user.email, None)
        if err:
            return HttpResponse(json.dumps(
                {'success': False, 'error_message': f'Failed to schedule workflow execution'}),
                status=500, content_type='application/json')

        return HttpResponse(json.dumps({'success': True, 'workflow_run_id': workflow_run_uuid}), status=200,
                            content_type='application/json')
    except Exception as e:
        logger.error(f'Error executing workflow: {str(e)}')
        return HttpResponse(json.dumps({'success': False, 'error_message': 'An internal error has occurred!'}),
                            status=500, content_type='application/json')


@account_get_api()
def workflows_execution_api_get(request_message: HttpRequest) -> Union[ExecutionWorkflowGetResponse, HttpResponse]:
    account: Account = get_request_account()
    query_dict = request_message.GET
    if 'workflow_run_id' not in query_dict:
        return HttpResponse(json.dumps({'success': False, 'error_message': 'Request Workflow params not found.'}),
                            status=400, content_type='application/json')
    request_dict = dict(query_dict)
    workflow_run_id = request_dict.get('workflow_run_id')
    if not workflow_run_id:
        return HttpResponse(json.dumps({'success': False, 'error_message': 'Request Workflow params not found.'}),
                            status=400, content_type='application/json')
    if isinstance(workflow_run_id, list):
        workflow_run_ids = workflow_run_id
    else:
        workflow_run_ids = [workflow_run_id]
    try:
        workflow_executions = get_db_workflow_executions(account, workflow_run_ids=workflow_run_ids)
        if not workflow_executions:
            return HttpResponse(json.dumps({'success': False, 'error_message': 'Workflow Executions not found.'}),
                                status=404, content_type='application/json')
    except Exception as e:
        logger.error(traceback.format_exc())
        return HttpResponse(json.dumps({'success': False, 'error_message': 'An internal error has occurred!'}),
                            status=500,
                            content_type='application/json')

    workflow_execution_protos = [we.proto for we in workflow_executions]
    return ExecutionWorkflowGetResponse(success=BoolValue(value=True), workflow_executions=workflow_execution_protos)


@web_api(CreateWorkflowRequest)
def test_workflows_notification(request_message: CreateWorkflowRequest) -> Union[CreateWorkflowResponse, HttpResponse]:
    account: Account = get_request_account()
    user = get_request_user()
    workflow: Workflow = request_message.workflow

    if not workflow.playbooks or workflow.playbooks == []:
        return CreateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request", description="Select a playbook"))

    if not workflow.entry_points or workflow.entry_points == []:
        return CreateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request", description="Select the trigger type"))

    if not workflow.actions or workflow.actions == []:
        return CreateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request",
                                                      description="Select a notification type"))

    test_workflow_notification(user, account.id, workflow, workflow.actions[0].type)
    return CreateWorkflowResponse(success=BoolValue(value=True))


@web_api(ExecuteWorkflowRequest)
def generate_curl(request_message: ExecuteWorkflowRequest) -> HttpResponse:
    account: Account = get_request_account()
    user = get_request_user()
    workflow_id = request_message.workflow_id.value
    workflow_name = request_message.workflow_name.value
    location = settings.WORKFLOW_EXECUTE_API_PATH
    location = '/executor/workflows/' + location if not location.startswith('/') else location
    protocol = settings.WORKFLOW_EXECUTE_API_SITE_HTTP_PROTOCOL
    enabled = settings.WORKFLOW_EXECUTE_API_USE_SITE
    uri = build_absolute_uri(None, location, protocol, enabled)

    if workflow_id:
        payload = {'workflow_id': workflow_id}
    elif workflow_name:
        payload = {'workflow_name': workflow_name}
    else:
        return HttpResponse('Request Workflow params not found.', status=400, content_type="text/plain")

    qs = account.account_api_token.filter(created_by=user)
    if qs:
        account_api_token = qs.first()
    else:
        api_token = AccountApiToken(account=account, created_by=user)
        api_token.save()
        account_api_token = api_token

    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {account_api_token.key}'}
    curl = construct_curl('POST', uri, headers=headers, payload=payload)
    return HttpResponse(curl, content_type="text/plain", status=200)


@web_api(TestWorkflowTransformerRequest)
def test_workflows_transformer(request_message: TestWorkflowTransformerRequest) -> \
        Union[TestWorkflowTransformerResponse, HttpResponse]:
    lambda_function: Lambda.Function = request_message.transformer_lambda_function
    event = request_message.event
    try:
        event_context = test_workflow_transformer(lambda_function, event)
        if not isinstance(event_context, dict):
            return TestWorkflowTransformerResponse(success=BoolValue(value=False),
                                                   message=Message(title="Error",
                                                                   description="Transformer function did not return a valid dictioanry."))
        event_context_struct = dict_to_proto(event_context, Struct)
        return TestWorkflowTransformerResponse(success=BoolValue(value=True), event_context=event_context_struct)
    except Exception as e:
        return TestWorkflowTransformerResponse(success=BoolValue(value=False),
                                               message=Message(title="Error", description=str(e)))
