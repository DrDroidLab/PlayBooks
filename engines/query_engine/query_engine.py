from django.db.models import QuerySet

from protos.query_base_pb2 import QueryRequest
from engines.base.context import ContextResolver


class QueryEngineException(ValueError):
    pass


class QueryEngine:
    def __init__(self, model, context_resolver: ContextResolver):
        self._model = model
        self._context_resolver = context_resolver

    def get_qs(self, account):
        return self._context_resolver.qs(account)

    def get_filter_options(self, account, *args, **kwargs):
        return self._context_resolver.get_filter_options(account, *args, **kwargs)

    def process_query(self, qs: QuerySet, query_request: QueryRequest) -> QuerySet:
        if qs.model is not self._model:
            raise QueryEngineException(f'Query engine not supported for {qs.model.__name__}')
        return self._context_resolver.filter_engine().process(qs, query_request.filter)
