import logging
from abc import abstractmethod

from accounts.models import Account
from engines.query_engine.filters.filter_engine import FilterEngine
from protos.base_pb2 import Op
from protos.literal_pb2 import IdLiteral, Literal, LiteralType
from protos.query_base_pb2 import Filter, Expression, ColumnIdentifier, QueryRequest

logger = logging.getLogger(__name__)


class ContextResolver:
    columns = None
    timestamp_field = None
    parent_model = None
    parent_column_name: str = None

    def __init__(self):
        self._filter_engine = FilterEngine(self.columns)

    @abstractmethod
    def qs(self, account):
        raise NotImplementedError()

    def filter_engine(self):
        return self._filter_engine

    def get_parent_obj(self, account, id_literal: IdLiteral = None):
        if id_literal.type == IdLiteral.Type.LONG:
            try:
                return self.parent_model.objects.get(account=account, id=id_literal.long.value)
            except self.parent_model.DoesNotExist:
                raise ValueError(f'{self.parent_model.__name__} with id {id_literal.long.value} not found')
        elif id_literal.type == IdLiteral.Type.STRING:
            id_column = id_literal.id_column.value
            try:
                column_filter = {
                    id_column: id_literal.string.value
                }
                return self.parent_model.objects.get(account=account, **column_filter)
            except self.parent_model.DoesNotExist:
                raise ValueError(f'{self.parent_model.__name__} with id {id_literal.string.value} not found')

    def get_parent_id_filter(self, id_literal_obj: IdLiteral = None):
        return Filter(
            lhs=Expression(column_identifier=ColumnIdentifier(name=self.parent_column_name, type=LiteralType.ID)),
            op=Op.EQ,
            rhs=Expression(
                literal=Literal(
                    type=LiteralType.ID,
                    id=id_literal_obj
                )
            )
        )

    def get_default_query(self, account, obj=None):
        if type(account) is not Account:
            raise ValueError(f'{account} needs to be Account')
        return QueryRequest(filter=Filter(op=Op.AND, filters=[]))
