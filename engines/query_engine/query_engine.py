from django.db.models import QuerySet

from engines.query_engine.context import ContextResolver, get_context_resolver
from executor.models import PlayBook, PlayBookExecution
from executor.workflows.models import Workflow, WorkflowExecution
from protos.base_pb2 import Context
from protos.engines.query_base_pb2 import QueryRequest
from protos.literal_pb2 import IdLiteral


class QueryEngineException(ValueError):
    pass


def get_default_query(account, obj) -> QueryRequest:
    return QueryRequest()


class QueryEngine:
    def __init__(self, model, context_resolver: ContextResolver):
        self._model = model
        self._context_resolver = context_resolver

    def process_query(self, qs: QuerySet, query_request: QueryRequest) -> QuerySet:
        if qs.model is not self._model:
            raise QueryEngineException(f'Query engine not supported for {qs.model.__name__}')
        return self._context_resolver.filter_engine().process(qs, query_request.filter)

    def process_query_with_filter(self, qs: QuerySet, query_filter) -> QuerySet:
        if qs.model is not self._model:
            raise QueryEngineException(f'Query engine not supported for {qs.model.__name__}')
        return self._context_resolver.filter_engine().process(qs, query_filter)

    def get_obj(self, account, id: IdLiteral = None):
        return self._context_resolver.get_parent_obj(account, id)

    def get_default_query(self, account, obj=None):
        return self._context_resolver.get_default_query(account, obj)


playbook_search_engine = QueryEngine(
    PlayBook,
    get_context_resolver(Context.PLAYBOOK),
)

playbook_execution_search_engine = QueryEngine(
    PlayBookExecution,
    get_context_resolver(Context.PLAYBOOK_EXECUTION),
)

workflow_search_engine = QueryEngine(
    Workflow,
    get_context_resolver(Context.WORKFLOW),
)

workflow_execution_search_engine = QueryEngine(
    WorkflowExecution,
    get_context_resolver(Context.WORKFLOW_EXECUTION),
)
