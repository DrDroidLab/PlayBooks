from datetime import datetime

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, DoubleValue, Int64Value, BoolValue

from protos.literal_pb2 import Literal, LiteralType, IdLiteral

_SCALAR_LITERALS_TYPES = {
    LiteralType.STRING,
    LiteralType.LONG,
    LiteralType.DOUBLE,
    LiteralType.BOOLEAN,
    LiteralType.TIMESTAMP,
    LiteralType.ID
}

_GROUPABLE_LITERALS_TYPES = {
    LiteralType.STRING,
    LiteralType.LONG,
    LiteralType.BOOLEAN
}

_ARRAY_LITERALS_TYPES = {
    LiteralType.STRING_ARRAY,
    LiteralType.LONG_ARRAY,
    LiteralType.DOUBLE_ARRAY,
    LiteralType.BOOLEAN_ARRAY,
    LiteralType.ID_ARRAY
}


def is_scalar(lt_type: LiteralType) -> bool:
    return lt_type in _SCALAR_LITERALS_TYPES


def is_array(lt_type: LiteralType) -> bool:
    return lt_type in _ARRAY_LITERALS_TYPES


def is_groupable(lt_type: LiteralType) -> bool:
    return lt_type in _GROUPABLE_LITERALS_TYPES


def literal_to_obj(lt: Literal):
    if lt.type == LiteralType.STRING:
        return lt.string.value
    elif lt.type == LiteralType.LONG:
        return lt.long.value
    elif lt.type == LiteralType.DOUBLE:
        return lt.double.value
    elif lt.type == LiteralType.BOOLEAN:
        return lt.boolean.value
    elif lt.type == LiteralType.TIMESTAMP:
        return datetime.utcfromtimestamp(lt.timestamp)
    elif lt.type == LiteralType.ID:
        id_literal = lt.id
        if id_literal.type == IdLiteral.Type.LONG:
            return id_literal.long.value
        elif id_literal.type == IdLiteral.Type.STRING:
            return id_literal.string.value
    elif lt.type == LiteralType.STRING_ARRAY:
        return list(lt.string_array)
    elif lt.type == LiteralType.LONG_ARRAY:
        return list(lt.long_array)
    elif lt.type == LiteralType.DOUBLE_ARRAY:
        return list(lt.double_array)
    elif lt.type == LiteralType.BOOLEAN_ARRAY:
        return list(lt.boolean_array)
    elif lt.type == LiteralType.ID_ARRAY:
        ids = []
        for id_literal in lt.id_array:
            if id_literal.type == IdLiteral.Type.LONG:
                ids.append(id_literal.long.value)
            elif id_literal.type == IdLiteral.Type.STRING:
                ids.append(id_literal.string.value)
        return ids
    elif lt.type == LiteralType.NULL_STRING:
        return ''
    elif lt.type == LiteralType.NULL_NUMBER:
        return 0
    return None


def display_literal(lt: Literal):
    if lt.type == LiteralType.STRING:
        return f'"{lt.string.value}"'
    elif lt.type == LiteralType.LONG:
        return lt.long.value
    elif lt.type == LiteralType.DOUBLE:
        return lt.double.value
    elif lt.type == LiteralType.BOOLEAN:
        return lt.boolean.value
    elif lt.type == LiteralType.TIMESTAMP:
        return datetime.utcfromtimestamp(lt.timestamp)
    elif lt.type == LiteralType.ID:
        id_literal = lt.id
        if id_literal.type == IdLiteral.Type.LONG:
            return id_literal.long.value
        elif id_literal.type == IdLiteral.Type.STRING:
            return f'"{id_literal.string.value}"'
    elif lt.type == LiteralType.STRING_ARRAY:
        return [f'"{string}"' for string in lt.string_array]
    elif lt.type == LiteralType.LONG_ARRAY:
        return list(lt.long_array)
    elif lt.type == LiteralType.DOUBLE_ARRAY:
        return list(lt.double_array)
    elif lt.type == LiteralType.BOOLEAN_ARRAY:
        return list(lt.boolean_array)
    elif lt.type == LiteralType.ID_ARRAY:
        ids = []
        for id_literal in lt.id_array:
            if id_literal.type == IdLiteral.Type.LONG:
                ids.append(id_literal.long.value)
            elif id_literal.type == IdLiteral.Type.STRING:
                ids.append(f'"{id_literal.string.value}"')
        return ids
    elif lt.type == LiteralType.NULL_STRING:
        return '""'
    elif lt.type == LiteralType.NULL_NUMBER:
        return 0
    return None


def obj_to_literal(o, is_id=False):
    if o is None:
        return Literal(type=LiteralType.NULL_NUMBER)
    elif isinstance(o, bool):
        return Literal(type=LiteralType.BOOLEAN, boolean=BoolValue(value=o))
    elif isinstance(o, str):
        if is_id:
            return Literal(type=LiteralType.ID, id=IdLiteral(type=IdLiteral.Type.STRING, string=StringValue(value=o)))
        return Literal(type=LiteralType.STRING, string=StringValue(value=o))
    elif isinstance(o, int):
        if is_id:
            return Literal(type=LiteralType.ID, id=IdLiteral(type=IdLiteral.Type.LONG, long=UInt64Value(value=o)))
        return Literal(type=LiteralType.LONG, long=Int64Value(value=o))
    elif isinstance(o, float):
        return Literal(type=LiteralType.DOUBLE, double=DoubleValue(value=o))
    elif isinstance(o, datetime):
        return Literal(type=LiteralType.TIMESTAMP, timestamp=int(o.timestamp()))
    else:
        raise ValueError('Unexpected type')
