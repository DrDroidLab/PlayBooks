from typing import List, Dict

from django.db.models import Q

from engines.base.filter_token_op import NumericColumnTokenFilterOp, StringColumnTokenFilterOp, \
    BooleanColumnTokenFilterOp, TimestampColumnTokenFilterOp, IDColumnTokenFilterOp, LiteralArrayColumnTokenFilterOp, \
    AttributeTokenFilterOp, TokenFilterOp, AttributeTokenV2FilterOp
from engines.base.literal import is_scalar
from engines.base.op import validate_query
from engines.base.token import Token, OpToken, AttributeToken, ColumnToken, Filterable, Annotable, ExpressionTokenizer, \
    LiteralToken, AttributeTokenV2
from protos.engines.literal_pb2 import LiteralType
from protos.engines.query_base_pb2 import Op, Filter as FilterProto

CONNECTOR_OPS = [Op.AND, Op.OR, Op.NOT]


class FilterToken(Token):
    lhs: Token = None
    op: OpToken = None
    rhs: Token = None
    child_filters: List[Token] = None

    def __init__(self, lhs: Token, op: OpToken, rhs: Token, child_filters: List[Token] = None):
        self.lhs = lhs
        self.op = op
        self.rhs = rhs
        self.child_filters = child_filters or []

    def display(self):
        if self.child_filters:
            return f' {self.op.display()} '.join([f.display() for f in self.child_filters])
        else:
            return f'({self.lhs.display()} {self.op.display()} {self.rhs.display()})'


class FilterTokenProcessor:
    def __init__(self):
        self._default_scalar_column_literal_filter_op_dict = {
            LiteralType.LONG: NumericColumnTokenFilterOp(),
            LiteralType.DOUBLE: NumericColumnTokenFilterOp(),
            LiteralType.STRING: StringColumnTokenFilterOp(),
            LiteralType.BOOLEAN: BooleanColumnTokenFilterOp(),
            LiteralType.TIMESTAMP: TimestampColumnTokenFilterOp(),
            LiteralType.ID: IDColumnTokenFilterOp(),
        }

        self._default_array_column_literal_filter_op = LiteralArrayColumnTokenFilterOp()

        self._attribute_filter_op = AttributeTokenFilterOp()
        self._attribute_filter_op_v2 = AttributeTokenV2FilterOp()

    def _get_lhs_token_filter_op(self, lhs: Filterable) -> TokenFilterOp:
        if isinstance(lhs, AttributeToken):
            return self._attribute_filter_op
        elif isinstance(lhs, AttributeTokenV2):
            return self._attribute_filter_op_v2
        elif isinstance(lhs, ColumnToken):
            if lhs.column.token_filter_op and isinstance(lhs.column.token_filter_op, TokenFilterOp):
                return lhs.column.token_filter_op
            if is_scalar(lhs.column.type):
                return self._default_scalar_column_literal_filter_op_dict[lhs.column.type]
            else:
                return self._default_array_column_literal_filter_op
        else:
            raise ValueError(f'Unsupported LHS {lhs}')

    def process(self, f: Token) -> Q:
        if not isinstance(f, FilterToken):
            raise ValueError('FilterTokenProcessor can only process Filter')
        if f.op.op in CONNECTOR_OPS:
            if len(f.child_filters) == 0:
                return Q()
            op = f.op.op
            if op == Op.NOT and len(f.child_filters) > 1:
                raise ValueError('NOT expects a single child filter')
            processed = [self.process(child) for child in f.child_filters]
            base: Q = processed[0]
            if op == Op.NOT:
                return ~base
            elif op == Op.AND:
                for p in processed[1:]:
                    base = base & p
                return base
            elif op == Op.OR:
                for p in processed[1:]:
                    base = base | p
                return base

        return self._base_filter_processor(f)

    def _base_filter_processor(self, f: FilterToken) -> Q:
        if not isinstance(f.lhs, Filterable):
            raise ValueError(f'lhs {f.lhs} is not Filterable')
        token_filter_op = self._get_lhs_token_filter_op(f.lhs)
        return token_filter_op.process(f.lhs, f.op, f.rhs)


class FilterTokenAnnotator:
    def annotations(self, f: Token) -> Dict:
        if not isinstance(f, FilterToken):
            raise ValueError('FilterTokenAnnotator can only process Filter')
        annotations = {}
        if len(f.child_filters) > 0:
            for child in f.child_filters:
                annotations.update(self.annotations(child))

        if f.lhs and isinstance(f.lhs, Annotable):
            annotations.update(f.lhs.annotations())

        if f.rhs and isinstance(f.rhs, Annotable):
            annotations.update(f.rhs.annotations())

        return annotations


class FilterTokenizer:
    def __init__(self, columns):
        self._columns = columns
        self._expression_tokenizer = ExpressionTokenizer(columns)

    def tokenize(self, filter_proto: FilterProto) -> FilterToken:
        if filter_proto.ByteSize() == 0:
            return None
        child_filter_tokens = [self.tokenize(f) for f in filter_proto.filters]
        lhs_token = self._expression_tokenizer.tokenize(filter_proto.lhs)
        rhs_token = self._expression_tokenizer.tokenize(filter_proto.rhs)
        op_token = OpToken(op=filter_proto.op)

        return FilterToken(
            lhs=lhs_token,
            op=op_token,
            rhs=rhs_token,
            child_filters=child_filter_tokens
        )


class FilterTokenValidator:
    def validate(self, filter_token: FilterToken) -> (bool, str):
        if not filter_token or not filter_token.child_filters:
            return True, ''
        for token in filter_token.child_filters:
            if not isinstance(token, FilterToken):
                return False, 'Child filter must be Filter'
            is_filter_token_valid, err = self.validate(token)
            if not is_filter_token_valid:
                return False, err
        if filter_token.lhs is not None and filter_token.rhs is not None:
            lhs_token = filter_token.lhs
            rhs_token = filter_token.rhs
            op_token = filter_token.op

            if isinstance(lhs_token, ColumnToken) and isinstance(rhs_token, LiteralToken):
                is_filter_token_valid, err = validate_query(
                    lhs_token.column.type, op_token.op,
                    rhs_token.literal.literal_type
                )

                if not is_filter_token_valid:
                    return False, f'{err} not supported for column: {lhs_token.column.display_name}'

        return True, ''


class FilterTokenEvaluator:
    def __init__(self):
        self._filter_token_processor = FilterTokenProcessor()
        self._filter_token_annotator = FilterTokenAnnotator()

    def process(self, qs, filter_token: FilterToken):
        if not filter_token:
            return qs
        annotations = self._filter_token_annotator.annotations(filter_token)
        q = self._filter_token_processor.process(filter_token)
        filter_qs = qs.annotate(**annotations).filter(q)
        return filter_qs


class FilterEngine:
    def __init__(self, columns):
        self.columns = columns
        self._filter_tokenizer = FilterTokenizer(columns)
        self._filter_token_validator = FilterTokenValidator()
        self._filter_token_evaluator = FilterTokenEvaluator()

    def tokenize(self, filter_proto: FilterProto) -> FilterToken:
        return self._filter_tokenizer.tokenize(filter_proto)

    def validate(self, filter_token: FilterToken) -> (bool, str):
        return self._filter_token_validator.validate(filter_token)

    def evaluate(self, qs, filter_token: FilterToken):
        return self._filter_token_evaluator.process(qs, filter_token)

    def process(self, qs, filter_proto: FilterProto):
        filter_token: FilterToken = self.tokenize(filter_proto)
        if not filter_token:
            return qs
        query_validation_check, err = self.validate(filter_token)
        if not query_validation_check:
            raise ValueError(err)
        return self.evaluate(qs, filter_token)
