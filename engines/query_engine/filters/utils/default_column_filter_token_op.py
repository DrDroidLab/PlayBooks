from django.db.models import Q, Value

from engines.query_engine.filters.filter_token_op import ColumnTokenFilterOp
from engines.base.literal import is_scalar
from engines.base.token import LiteralToken
from protos.base_pb2 import Op


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
