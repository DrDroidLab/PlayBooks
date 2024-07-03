import abc
from typing import Union

from django.db.models import F

from engines.base.token import ColumnToken, OpToken, Filterable, LiteralToken


class TokenFilterOperator(abc.ABC):
    def process(self, lhs, op, rhs):
        pass


class ColumnTokenFilterOperator(TokenFilterOperator):
    supported_ops = None

    def rhs(self, rhs_token):
        if isinstance(rhs_token, Filterable):
            return F(rhs_token.filter_key())
        elif isinstance(rhs_token, LiteralToken):
            return rhs_token.literal_value
        else:
            raise ValueError('RHS must be Filterable or Literal')

    def q(self, lhs, op, rhs):
        pass

    def process(self, lhs_token: ColumnToken, op_token: OpToken, rhs_token: Union[Filterable, LiteralToken]):
        lhs = lhs_token.filter_key()
        op = op_token.op
        rhs = self.rhs(rhs_token)

        if lhs_token.column.supported_ops:
            if op not in lhs_token.column.supported_ops:
                raise ValueError(f'Query {op} not supported for {lhs_token}')
        else:
            if self.supported_ops and op not in self.supported_ops:
                raise ValueError(f'Query {op} not supported for {lhs_token}')

        return self.q(lhs, op, rhs)
