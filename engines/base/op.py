from protos.literal_pb2 import LiteralType, LiteralTypeDescription
from protos.engines.query_base_pb2 import OpRhs, OpMapping
from protos.base_pb2 import Op, OpDescription

OP_DESCRIPTIONS = [
    OpDescription(op=Op.EQ, label='='),
    OpDescription(op=Op.NEQ, label='!='),
    OpDescription(op=Op.GT, label='>'),
    OpDescription(op=Op.LT, label='<'),
    OpDescription(op=Op.GTE, label='>='),
    OpDescription(op=Op.LTE, label='<='),
    OpDescription(op=Op.IN, label='IN'),
    OpDescription(op=Op.NOT_IN, label='NOT IN'),
    OpDescription(op=Op.OR, label='OR', is_logical=True),
    OpDescription(op=Op.AND, label='AND', is_logical=True),
    OpDescription(op=Op.IS_NULL, label='IS NULL', is_unary=True),
    OpDescription(op=Op.EXISTS, label='EXISTS', is_unary=True),
    OpDescription(op=Op.NOT, label='NOT', is_unary=True, is_logical=True)
]
STRING_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.STRING),
    OpRhs(op=Op.NEQ, rhs=LiteralType.STRING),
    OpRhs(op=Op.IN, rhs=LiteralType.STRING_ARRAY),
    OpRhs(op=Op.NOT_IN, rhs=LiteralType.STRING_ARRAY),
    OpRhs(op=Op.IS_NULL, rhs=LiteralType.NULL_STRING),
    OpRhs(op=Op.EXISTS, rhs=LiteralType.NULL_STRING)
]

LONG_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.LONG),
    OpRhs(op=Op.NEQ, rhs=LiteralType.LONG),
    OpRhs(op=Op.GT, rhs=LiteralType.LONG),
    OpRhs(op=Op.LT, rhs=LiteralType.LONG),
    OpRhs(op=Op.GTE, rhs=LiteralType.LONG),
    OpRhs(op=Op.LTE, rhs=LiteralType.LONG),
    OpRhs(op=Op.IN, rhs=LiteralType.LONG_ARRAY),
    OpRhs(op=Op.NOT_IN, rhs=LiteralType.LONG_ARRAY),
    OpRhs(op=Op.IS_NULL, rhs=LiteralType.NULL_NUMBER),
    OpRhs(op=Op.EXISTS, rhs=LiteralType.NULL_NUMBER),
]

DOUBLE_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.NEQ, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.GT, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.LT, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.GTE, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.LTE, rhs=LiteralType.DOUBLE),
    OpRhs(op=Op.IN, rhs=LiteralType.DOUBLE_ARRAY),
    OpRhs(op=Op.NOT_IN, rhs=LiteralType.DOUBLE_ARRAY),
    OpRhs(op=Op.IS_NULL, rhs=LiteralType.NULL_NUMBER),
    OpRhs(op=Op.EXISTS, rhs=LiteralType.NULL_NUMBER),
]

BOOLEAN_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.BOOLEAN),
    OpRhs(op=Op.NEQ, rhs=LiteralType.BOOLEAN),
    OpRhs(op=Op.IS_NULL, rhs=LiteralType.NULL_NUMBER),
    OpRhs(op=Op.EXISTS, rhs=LiteralType.NULL_NUMBER),
]

TIMESTAMP_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.TIMESTAMP),
    OpRhs(op=Op.GT, rhs=LiteralType.TIMESTAMP),
    OpRhs(op=Op.LT, rhs=LiteralType.TIMESTAMP),
    OpRhs(op=Op.GTE, rhs=LiteralType.TIMESTAMP),
    OpRhs(op=Op.LTE, rhs=LiteralType.TIMESTAMP),
]

ID_LITERAL_OPS_RHS_MAP = [
    OpRhs(op=Op.EQ, rhs=LiteralType.ID),
    OpRhs(op=Op.IN, rhs=LiteralType.ID_ARRAY),
]

OP_MAPPINGS = [
    OpMapping(lhs=LiteralType.STRING, op_rhs=STRING_OPS_RHS_MAP),
    OpMapping(lhs=LiteralType.LONG, op_rhs=LONG_OPS_RHS_MAP),
    OpMapping(lhs=LiteralType.DOUBLE, op_rhs=DOUBLE_OPS_RHS_MAP),
    OpMapping(lhs=LiteralType.BOOLEAN, op_rhs=BOOLEAN_OPS_RHS_MAP),
    OpMapping(lhs=LiteralType.TIMESTAMP, op_rhs=TIMESTAMP_OPS_RHS_MAP),
    OpMapping(lhs=LiteralType.ID, op_rhs=ID_LITERAL_OPS_RHS_MAP),
]

LITERAL_TYPE_DESCRIPTIONS = [
    LiteralTypeDescription(literal_type=LiteralType.STRING, label='str'),
    LiteralTypeDescription(literal_type=LiteralType.LONG, label='long'),
    LiteralTypeDescription(literal_type=LiteralType.DOUBLE, label='double'),
    LiteralTypeDescription(literal_type=LiteralType.BOOLEAN, label='bool'),
    LiteralTypeDescription(literal_type=LiteralType.TIMESTAMP, label='timestamp'),
    LiteralTypeDescription(literal_type=LiteralType.ID, label='id'),
    LiteralTypeDescription(literal_type=LiteralType.STRING_ARRAY, label='str array'),
    LiteralTypeDescription(literal_type=LiteralType.LONG_ARRAY, label='long array'),
    LiteralTypeDescription(literal_type=LiteralType.DOUBLE_ARRAY, label='double array'),
    LiteralTypeDescription(literal_type=LiteralType.BOOLEAN_ARRAY, label='bool array'),
    LiteralTypeDescription(literal_type=LiteralType.ID_ARRAY, label='id array'),
]


def validate_query(lhs_type: LiteralType, op: Op, rhs_type: LiteralType) -> (bool, str):
    op_rhs: [OpRhs] = None
    for mapping in OP_MAPPINGS:
        if lhs_type == mapping.lhs:
            op_rhs = mapping.op_rhs
            break
    if not op_rhs:
        return False, op

    rhs: LiteralType = LiteralType.UNKNOWN_LT
    for op_rhs_mapping in op_rhs:
        if op == op_rhs_mapping.op:
            rhs = op_rhs_mapping.rhs
            break
    if rhs == LiteralType.UNKNOWN_LT or rhs_type != rhs:
        return False, "rhs type: {}".format(rhs_type)
    return True, ""
