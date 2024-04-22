import logging
from typing import Union

from django.db.models import QuerySet
from django.http import HttpResponse

from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import Account, get_request_account, get_request_user
from executor.workflows.crud.workflows_crud import create_db_workflow
from executor.workflows.crud.workflows_update_processor import workflows_update_processor
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.base_pb2 import Meta, Message, Page
from protos.playbooks.api_pb2 import GetWorkflowsRequest, GetWorkflowsResponse, CreateWorkflowRequest, \
    CreateWorkflowResponse, UpdateWorkflowRequest, UpdateWorkflowResponse
from protos.playbooks.workflow_pb2 import Workflow as WorkflowProto

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
