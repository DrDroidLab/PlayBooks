import abc
from functools import reduce
from typing import Union

from django.db.models import F, Q, Value

from engines.base.literal import is_scalar
from engines.base.token import Filterable, ColumnToken, OpToken, LiteralToken, AttributeToken, AttributeTokenV2
from protos.engines.query_base_pb2 import Op


class TokenFilterOp(abc.ABC):
    def process(self, lhs, op, rhs):
        pass


class ColumnTokenFilterOp(TokenFilterOp):
    supported_ops = None

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

    def rhs(self, rhs_token):
        if isinstance(rhs_token, Filterable):
            return F(rhs_token.filter_key())
        elif isinstance(rhs_token, LiteralToken):
            return rhs_token.literal_value
        else:
            raise ValueError('RHS must be Filterable or Literal')

    def q(self, lhs, op, rhs):
        pass


class IDColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.IN]

    def q(self, lhs, op, rhs):
        if op == Op.EQ:
            return Q(**{f'{lhs}': rhs})
        elif op == Op.IN:
            return Q(**{f'{lhs}__in': rhs})


class TimestampColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.GTE, Op.GT, Op.LTE, Op.LT]

    def q(self, lhs, op, rhs) -> Q:
        if op == Op.EQ:
            return Q(**{f'{lhs}': rhs})
        elif op == Op.GTE:
            return Q(**{f'{lhs}__gte': rhs})
        elif op == Op.GT:
            return Q(**{f'{lhs}__gt': rhs})
        elif op == Op.LTE:
            return Q(**{f'{lhs}__lte': rhs})
        elif op == Op.LT:
            return Q(**{f'{lhs}__lt': rhs})


class StringColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.NEQ, Op.IN, Op.NOT_IN, Op.IS_NULL, Op.EXISTS]

    def q(self, lhs, op, rhs) -> Q:
        if op == Op.EQ:
            return Q(**{f'{lhs}': rhs})
        elif op == Op.NEQ:
            return ~Q(**{f'{lhs}': rhs})
        elif op == Op.IN:
            return Q(**{f'{lhs}__in': rhs})
        elif op == Op.NOT_IN:
            return ~Q(**{f'{lhs}__in': rhs})
        elif op == Op.IS_NULL:
            return Q(**{f'{lhs}__isnull': True})
        elif op == Op.EXISTS:
            return Q(**{f'{lhs}__isnull': False})


class BooleanColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.NEQ, Op.EXISTS, Op.IS_NULL]

    def q(self, lhs, op, rhs) -> Q:
        if op == Op.EQ:
            return Q(**{f'{lhs}': rhs})
        elif op == Op.NEQ:
            return ~Q(**{f'{lhs}': rhs})
        elif op == Op.IS_NULL:
            return Q(**{f'{lhs}__isnull': True})
        elif op == Op.EXISTS:
            return Q(**{f'{lhs}__isnull': False})


class NumericColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.NEQ, Op.GT, Op.GTE, Op.LT, Op.LTE, Op.IN, Op.NOT_IN, Op.IS_NULL, Op.EXISTS]

    def q(self, lhs, op, rhs) -> Q:
        if op == Op.EQ:
            return Q(**{f'{lhs}': rhs})
        elif op == Op.NEQ:
            return ~Q(**{f'{lhs}': rhs})
        elif op == Op.GT:
            return Q(**{f'{lhs}__gt': rhs})
        elif op == Op.LT:
            return Q(**{f'{lhs}__lt': rhs})
        elif op == Op.GTE:
            return Q(**{f'{lhs}__gte': rhs})
        elif op == Op.LTE:
            return Q(**{f'{lhs}__lte': rhs})
        elif op == Op.IN:
            return Q(**{f'{lhs}__in': rhs})
        elif op == Op.NOT_IN:
            return ~Q(**{f'{lhs}__in': rhs})
        elif op == Op.IS_NULL:
            return Q(**{f'{lhs}__isnull': True})
        elif op == Op.EXISTS:
            return Q(**{f'{lhs}__isnull': False})


class LiteralArrayColumnTokenFilterOp(ColumnTokenFilterOp):
    supported_ops = [Op.EQ, Op.NEQ, Op.IN, Op.NOT_IN, Op.EXISTS, Op.IS_NULL]

    def rhs(self, rhs_token):
        if not isinstance(rhs_token, LiteralToken):
            raise ValueError('RHS must be Literal')
        if is_scalar(rhs_token.literal.literal_type):
            return [rhs_token.literal_value]
        return rhs_token.literal_value

    def q(self, lhs, op, rhs) -> Q:
        if op == Op.EQ or op == Op.IN:
            return Q(**{f'{lhs}__contains': rhs})
        elif op == Op.NEQ or op == Op.NOT_IN:
            return ~Q(**{f'{lhs}__contains': rhs})
        elif op == Op.EXISTS:
            return ~Q(**{f'{lhs}': Value([None])})
        elif op == Op.IS_NULL:
            return Q(**{f'{lhs}': Value([None])})


class AttributeTokenFilterOp(TokenFilterOp):
    @staticmethod
    def typecheck(lhs_token, op, rhs):
        if op == Op.IN and type(rhs) is not list:
            raise ValueError(f'IN expects a list type for values, query op not supported for {lhs_token}')
        elif op == Op.NOT_IN and type(rhs) is not list:
            raise ValueError(f'NOT_IN expects a list type for values, query op not supported for {lhs_token}')
        return

    def process(self, lhs_token: AttributeToken, op_token: OpToken, rhs_token: Union[Filterable, LiteralToken]):
        lhs = lhs_token.filter_key()
        op = op_token.op

        if isinstance(rhs_token, Filterable):
            rhs = F(rhs_token.filter_key())
        elif isinstance(rhs_token, LiteralToken):
            rhs = rhs_token.literal_value
            self.typecheck(lhs_token, op, rhs)
        else:
            raise ValueError('RHS must be Filterable or Literal')

        if op == Op.EQ:
            return Q(**{lhs: rhs})
        elif op == Op.NEQ:
            return ~Q(**{lhs: rhs})
        elif op == Op.GT:
            return Q(**{f'{lhs}__gt': rhs})
        elif op == Op.LT:
            return Q(**{f'{lhs}__lt': rhs})
        elif op == Op.GTE:
            return Q(**{f'{lhs}__gte': rhs})
        elif op == Op.LTE:
            return Q(**{f'{lhs}__lte': rhs})
        elif op == Op.IN:
            return Q(**{f'{lhs}__in': rhs})
        elif op == Op.NOT_IN:
            return ~Q(**{f'{lhs}__in': rhs})
        elif op == Op.IS_NULL:
            return Q(**{f'{lhs}__isnull': True})
        elif op == Op.EXISTS:
            return Q(**{f'{lhs}__isnull': False})
        else:
            raise ValueError(f'Query op not supported for {lhs_token}')


class AttributeTokenV2FilterOp(TokenFilterOp):
    @staticmethod
    def typecheck(lhs_token, op, rhs):
        if op == Op.IN and type(rhs) is not list:
            raise ValueError(f'IN expects a list type for values, query op not supported for {lhs_token}')
        elif op == Op.NOT_IN and type(rhs) is not list:
            raise ValueError(f'NOT_IN expects a list type for values, query op not supported for {lhs_token}')
        return

    def process(self, lhs_token: AttributeTokenV2, op_token: OpToken, rhs_token: Union[Filterable, LiteralToken]):
        lhs_list = lhs_token.filter_key()
        op = op_token.op

        if isinstance(rhs_token, Filterable):
            rhs = F(rhs_token.filter_key())
        elif isinstance(rhs_token, LiteralToken):
            rhs = rhs_token.literal_value
            self.typecheck(lhs_token, op, rhs)
        else:
            raise ValueError('RHS must be Filterable or Literal')
        filter_list = []
        for lhs in lhs_list:
            if op == Op.EQ:
                filter_list.append(Q(**{lhs: rhs}))
            elif op == Op.NEQ:
                filter_list.append(~Q(**{lhs: rhs}))
            elif op == Op.GT:
                filter_list.append(Q(**{f'{lhs}__gt': rhs}))
            elif op == Op.LT:
                filter_list.append(Q(**{f'{lhs}__lt': rhs}))
            elif op == Op.GTE:
                filter_list.append(Q(**{f'{lhs}__gte': rhs}))
            elif op == Op.LTE:
                filter_list.append(Q(**{f'{lhs}__lte': rhs}))
            elif op == Op.IN:
                filter_list.append(Q(**{f'{lhs}__in': rhs}))
            elif op == Op.NOT_IN:
                filter_list.append(~Q(**{f'{lhs}__in': rhs}))
            elif op == Op.IS_NULL:
                filter_list.append(Q(**{f'{lhs}__isnull': True}))
            elif op == Op.EXISTS:
                filter_list.append(Q(**{f'{lhs}__isnull': False}))
            else:
                raise ValueError(f'Query op not supported for {lhs_token}')

        return reduce(lambda x, y: x | y, filter_list)
