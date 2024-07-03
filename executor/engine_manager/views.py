from typing import Union

from django.http import HttpResponse
from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import Account, get_request_account
from executor.engine_manager.context_resolver import get_query_engine
from playbooks.utils.decorators import web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from protos.base_pb2 import Context, Message
from protos.playbooks.api_pb2 import SearchQueryRequest, SearchQueryResponse, SearchPlaybooksResponse, \
    SearchWorkflowsResponse, SearchPlaybookExecutionResponse, SearchWorkflowExecutionResponse


@web_api(SearchQueryRequest)
def search(request_message: SearchQueryRequest) -> Union[SearchQueryResponse, HttpResponse]:
    account: Account = get_request_account()
    page = request_message.meta.page
    context: Context = request_message.context
    query_request = request_message.query

    query_engine = get_query_engine(context)
    if not query_engine:
        return SearchQueryResponse(success=BoolValue(value=False), message=Message(title='Error in query engine',
                                                                                   description='No query engine found for context'))

    qs = query_engine.get_qs(account)
    qs = query_engine.process_query(qs, query_request)

    total_count = qs.count()
    qs = filter_page(qs, page)
    if context == Context.PLAYBOOK:
        protos = [pb.proto_partial for pb in qs]
        return SearchQueryResponse(meta=get_meta(page=page, total_count=total_count),
                                   playbook=SearchPlaybooksResponse(results=protos))
    elif context == Context.PLAYBOOK_EXECUTION:
        protos = [pbe.proto_partial for pbe in qs]
        return SearchQueryResponse(meta=get_meta(page=page, total_count=total_count),
                                   playbook_execution=SearchPlaybookExecutionResponse(results=protos))
    elif context == Context.WORKFLOW:
        protos = [wf.proto_partial for wf in qs]
        return SearchQueryResponse(meta=get_meta(page=page, total_count=total_count),
                                   workflow=SearchWorkflowsResponse(results=protos))
    elif context == Context.WORKFLOW_EXECUTION:
        protos = [wfe.proto_partial for wfe in qs]
        return SearchQueryResponse(meta=get_meta(page=page, total_count=total_count),
                                   workflow_execution=SearchWorkflowExecutionResponse(results=protos))

    return SearchQueryResponse(success=BoolValue(value=False), message=Message(title='Error in query engine',
                                                                               description='No results found for context'))
