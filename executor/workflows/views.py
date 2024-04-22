import logging
from typing import Union

from django.db.models import QuerySet
from django.http import HttpResponse

from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import Account, get_request_account, get_request_user
from executor.workflows.crud.workflows_crud import create_db_workflow
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.base_pb2 import Meta, Message, Page
from protos.playbooks.api_pb2 import GetWorkflowsRequest, GetWorkflowsResponse, CreateWorkflowRequest, \
    CreateWorkflowResponse
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
    workflow, error = create_db_workflow(account, user, workflow)
    if error:
        return CreateWorkflowResponse(success=BoolValue(value=False), message=Message(title="Error", description=error))
    return CreateWorkflowResponse(success=BoolValue(value=True), workflow=workflow.proto)

# @web_api(UpdatePlaybookRequest)
# def workflows_update(request_message: UpdatePlaybookRequest) -> Union[UpdatePlaybookResponse, HttpResponse]:
#     account: Account = get_request_account()
#     user = get_request_user()
#     playbook_id = request_message.playbook_id.value
#     update_playbook_ops = request_message.update_playbook_ops
#     if not playbook_id or not update_playbook_ops:
#         return UpdatePlaybookResponse(success=BoolValue(value=False),
#                                       message=Message(title="Invalid Request", description="Missing playbook_id/ops"))
#     account_playbook = account.playbook_set.get(id=playbook_id)
#     if account_playbook.created_by != user.email:
#         return UpdatePlaybookResponse(success=BoolValue(value=False),
#                                       message=Message(title="Invalid Request",
#                                                       description="Unauthorized Action for user"))
#     try:
#         playbooks_update_processor.update(account_playbook, update_playbook_ops)
#     except Exception as e:
#         logger.error(f"Error updating playbook: {e}")
#         return UpdatePlaybookResponse(success=BoolValue(value=False),
#                                       message=Message(title="Error", description=str(e)))
#     return UpdatePlaybookResponse(success=BoolValue(value=True))
