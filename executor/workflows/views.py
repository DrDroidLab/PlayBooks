import logging
from datetime import timedelta
from typing import Union

from django.db.models import QuerySet
from django.http import HttpResponse

from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from accounts.models import Account, get_request_account, get_request_user
from executor.workflows.crud.workflow_execution_crud import create_workflow_execution, get_db_workflow_executions
from executor.workflows.crud.workflows_crud import create_db_workflow
from executor.workflows.crud.workflows_update_processor import workflows_update_processor
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from playbooks.utils.utils import current_datetime
from protos.base_pb2 import Meta, Message, Page, TimeRange
from protos.playbooks.api_pb2 import GetWorkflowsRequest, GetWorkflowsResponse, CreateWorkflowRequest, \
    CreateWorkflowResponse, UpdateWorkflowRequest, UpdateWorkflowResponse, ExecuteWorkflowRequest, \
    ExecuteWorkflowResponse, ExecutionWorkflowGetRequest, ExecutionWorkflowGetResponse, ExecutionsWorkflowsListResponse, \
    ExecutionsWorkflowsListRequest
from protos.playbooks.workflow_pb2 import Workflow as WorkflowProto, WorkflowSchedule as WorkflowScheduleProto, \
    WorkflowPeriodicSchedule as WorkflowPeriodicScheduleProto
from utils.proto_utils import dict_to_proto

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
    workflow: WorkflowProto = request_message.workflow
    if not workflow or not workflow.name:
        return CreateWorkflowResponse(success=BoolValue(value=False),
                                      message=Message(title="Invalid Request", description="Missing name/workflow"))
    workflow, error = create_db_workflow(account, user.email, workflow)
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
        schedule_type = account_workflow.schedule_type
        schedule: WorkflowScheduleProto = dict_to_proto(account_workflow.schedule, WorkflowScheduleProto)
        if schedule_type == WorkflowScheduleProto.Type.PERIODIC:
            periodic_schedule: WorkflowPeriodicScheduleProto = schedule.periodic
            interval = periodic_schedule.interval.value
            duration_in_seconds = periodic_schedule.duration_in_seconds.value
            scheduled_at = current_time_utc
            expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)
            time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600, time_lt=int(scheduled_at.timestamp()))
            workflow_run_uuid = f'{account.id}_{workflow_id}_{str(int(current_time_utc.timestamp()))}_wf_run'
            create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, expiry_at,
                                      interval, user.email)
            return ExecuteWorkflowResponse(success=BoolValue(value=True),
                                           workflow_run_id=StringValue(value=workflow_run_uuid))
    except Exception as e:
        logger.error(f"Error updating playbook: {e}")
        return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                       message=Message(title="Error", description=str(e)))


@web_api(ExecutionWorkflowGetRequest)
def workflows_execution_get(request_message: ExecutionWorkflowGetRequest) -> \
        Union[ExecutionWorkflowGetResponse, HttpResponse]:
    account: Account = get_request_account()
    workflow_run_id = request_message.workflow_run_id.value
    if not workflow_run_id:
        return ExecutionWorkflowGetResponse(success=BoolValue(value=False), message=Message(title="Invalid Request",
                                                                                            description="Missing workflow_run_id"))
    try:
        workflow_execution = get_db_workflow_executions(account, workflow_run_id=workflow_run_id)
        if not workflow_execution:
            return ExecutionWorkflowGetResponse(success=BoolValue(value=False), message=Message(title="Error",
                                                                                                description="Workflow Execution not found"))
    except Exception as e:
        return ExecutionWorkflowGetResponse(success=BoolValue(value=False),
                                            message=Message(title="Error", description=str(e)))

    workflow_execution = workflow_execution.first()
    return ExecutionWorkflowGetResponse(success=BoolValue(value=True), workflow_execution=workflow_execution.proto)


@web_api(ExecutionsWorkflowsListRequest)
def workflows_execution_list(request_message: ExecutionsWorkflowsListRequest) -> \
        Union[ExecutionsWorkflowsListResponse, HttpResponse]:
    account: Account = get_request_account()
    workflow_ids = request_message.workflow_ids
    try:
        workflow_executions = get_db_workflow_executions(account, workflow_ids=workflow_ids)
        if not workflow_executions:
            return ExecutionsWorkflowsListResponse(success=BoolValue(value=False), message=Message(title="Error",
                                                                                                   description="Workflow Executions not found"))
        we_protos = [we.proto_partial for we in workflow_executions]
        return ExecutionsWorkflowsListResponse(success=BoolValue(value=True), workflow_executions=we_protos)
    except Exception as e:
        return ExecutionsWorkflowsListResponse(success=BoolValue(value=False),
                                               message=Message(title="Error", description=str(e)))
