from collections import defaultdict
from datetime import datetime

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, DoubleValue, Int64Value, BoolValue

from protos.literal_pb2 import Literal, LiteralType, IdLiteral

_SCALAR_LITERALS = {
    LiteralType.STRING,
    LiteralType.LONG,
    LiteralType.DOUBLE,
    LiteralType.BOOLEAN,
    LiteralType.TIMESTAMP,
    LiteralType.ID
}


def is_scalar(lt: LiteralType):
    return lt in _SCALAR_LITERALS


def literal_to_obj(lt: Literal):
    if lt.literal_type == LiteralType.STRING:
        return lt.string.value
    elif lt.literal_type == LiteralType.LONG:
        return lt.long.value
    elif lt.literal_type == LiteralType.DOUBLE:
        return lt.double.value
    elif lt.literal_type == LiteralType.BOOLEAN:
        return lt.boolean.value
    elif lt.literal_type == LiteralType.TIMESTAMP:
        return datetime.utcfromtimestamp(lt.timestamp)
    elif lt.literal_type == LiteralType.ID:
        id_literal = lt.id
        if id_literal.type == IdLiteral.Type.LONG:
            return id_literal.long.value
        elif id_literal.type == IdLiteral.Type.STRING:
            return id_literal.string.value
    elif lt.literal_type == LiteralType.STRING_ARRAY:
        return list(lt.string_array)
    elif lt.literal_type == LiteralType.LONG_ARRAY:
        return list(lt.long_array)
    elif lt.literal_type == LiteralType.DOUBLE_ARRAY:
        return list(lt.double_array)
    elif lt.literal_type == LiteralType.BOOLEAN_ARRAY:
        return list(lt.boolean_array)
    elif lt.literal_type == LiteralType.ID_ARRAY:
        ids = []
        for id_literal in lt.id_array:
            if id_literal.type == IdLiteral.Type.LONG:
                ids.append(id_literal.long.value)
            elif id_literal.type == IdLiteral.Type.STRING:
                ids.append(id_literal.string.value)
        return ids
    elif lt.literal_type == LiteralType.NULL_STRING:
        return ''
    elif lt.literal_type == LiteralType.NULL_NUMBER:
        return 0

    return None


def display_literal(lt: Literal):
    if lt.literal_type == LiteralType.STRING:
        return f'"{lt.string.value}"'
    elif lt.literal_type == LiteralType.LONG:
        return lt.long.value
    elif lt.literal_type == LiteralType.DOUBLE:
        return lt.double.value
    elif lt.literal_type == LiteralType.BOOLEAN:
        return lt.boolean.value
    elif lt.literal_type == LiteralType.TIMESTAMP:
        return datetime.utcfromtimestamp(lt.timestamp)
    elif lt.literal_type == LiteralType.ID:
        id_literal = lt.id
        if id_literal.type == IdLiteral.Type.LONG:
            return id_literal.long.value
        elif id_literal.type == IdLiteral.Type.STRING:
            return f'"{id_literal.string.value}"'
    elif lt.literal_type == LiteralType.STRING_ARRAY:
        return [f'"{string}"' for string in lt.string_array]
    elif lt.literal_type == LiteralType.LONG_ARRAY:
        return list(lt.long_array)
    elif lt.literal_type == LiteralType.DOUBLE_ARRAY:
        return list(lt.double_array)
    elif lt.literal_type == LiteralType.BOOLEAN_ARRAY:
        return list(lt.boolean_array)
    elif lt.literal_type == LiteralType.ID_ARRAY:
        ids = []
        for id_literal in lt.id_array:
            if id_literal.type == IdLiteral.Type.LONG:
                ids.append(id_literal.long.value)
            elif id_literal.type == IdLiteral.Type.STRING:
                ids.append(f'"{id_literal.string.value}"')
        return ids
    elif lt.literal_type == LiteralType.NULL_STRING:
        return '""'
    elif lt.literal_type == LiteralType.NULL_NUMBER:
        return 0

    return None


def obj_to_literal(o, is_id=False):
    if o is None:
        return Literal(literal_type=LiteralType.NULL_NUMBER)
    elif isinstance(o, bool):
        return Literal(literal_type=LiteralType.BOOLEAN, boolean=BoolValue(value=o))
    elif isinstance(o, str):
        if is_id:
            return Literal(
                literal_type=LiteralType.ID,
                id=IdLiteral(type=IdLiteral.Type.STRING, string=StringValue(value=o))
            )
        return Literal(literal_type=LiteralType.STRING, string=StringValue(value=o))
    elif isinstance(o, int):
        if is_id:
            return Literal(
                literal_type=LiteralType.ID,
                id=IdLiteral(type=IdLiteral.Type.LONG, long=UInt64Value(value=o))
            )
        return Literal(literal_type=LiteralType.LONG, long=Int64Value(value=o))
    elif isinstance(o, float):
        return Literal(literal_type=LiteralType.DOUBLE, double=DoubleValue(value=o))
    elif isinstance(o, datetime):
        return Literal(literal_type=LiteralType.TIMESTAMP, timestamp=int(o.timestamp()))
    else:
        raise ValueError('Unexpected type')



_literal_type_is_groupable = defaultdict(lambda: False, {
    LiteralType.STRING: True,
    LiteralType.LONG: True,
    LiteralType.BOOLEAN: True,
    LiteralType.DOUBLE: False
})


def literal_type_is_groupable(literal_type: LiteralType) -> bool:
    return _literal_type_is_groupable.get(literal_type, False)
