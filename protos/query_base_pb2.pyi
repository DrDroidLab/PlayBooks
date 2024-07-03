"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import collections.abc
import google.protobuf.descriptor
import google.protobuf.internal.containers
import google.protobuf.message
import google.protobuf.wrappers_pb2
import protos.base_pb2
import protos.literal_pb2
import sys

if sys.version_info >= (3, 8):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class GlobalQueryOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    OP_DESCRIPTIONS_FIELD_NUMBER: builtins.int
    OP_MAPPING_FIELD_NUMBER: builtins.int
    LITERAL_TYPE_DESCRIPTION_FIELD_NUMBER: builtins.int
    @property
    def op_descriptions(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.base_pb2.OpDescription]: ...
    @property
    def op_mapping(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___OpMapping]: ...
    @property
    def literal_type_description(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.literal_pb2.LiteralTypeDescription]: ...
    def __init__(
        self,
        *,
        op_descriptions: collections.abc.Iterable[protos.base_pb2.OpDescription] | None = ...,
        op_mapping: collections.abc.Iterable[global___OpMapping] | None = ...,
        literal_type_description: collections.abc.Iterable[protos.literal_pb2.LiteralTypeDescription] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["literal_type_description", b"literal_type_description", "op_descriptions", b"op_descriptions", "op_mapping", b"op_mapping"]) -> None: ...

global___GlobalQueryOptions = GlobalQueryOptions

@typing_extensions.final
class OpRhs(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    OP_FIELD_NUMBER: builtins.int
    RHS_FIELD_NUMBER: builtins.int
    op: protos.base_pb2.Op.ValueType
    rhs: protos.literal_pb2.LiteralType.ValueType
    def __init__(
        self,
        *,
        op: protos.base_pb2.Op.ValueType = ...,
        rhs: protos.literal_pb2.LiteralType.ValueType = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["op", b"op", "rhs", b"rhs"]) -> None: ...

global___OpRhs = OpRhs

@typing_extensions.final
class OpMapping(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    LHS_FIELD_NUMBER: builtins.int
    OP_RHS_FIELD_NUMBER: builtins.int
    lhs: protos.literal_pb2.LiteralType.ValueType
    @property
    def op_rhs(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___OpRhs]: ...
    def __init__(
        self,
        *,
        lhs: protos.literal_pb2.LiteralType.ValueType = ...,
        op_rhs: collections.abc.Iterable[global___OpRhs] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["lhs", b"lhs", "op_rhs", b"op_rhs"]) -> None: ...

global___OpMapping = OpMapping

@typing_extensions.final
class ColumnIdentifier(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    NAME_FIELD_NUMBER: builtins.int
    TYPE_FIELD_NUMBER: builtins.int
    name: builtins.str
    type: protos.literal_pb2.LiteralType.ValueType
    def __init__(
        self,
        *,
        name: builtins.str = ...,
        type: protos.literal_pb2.LiteralType.ValueType = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["name", b"name", "type", b"type"]) -> None: ...

global___ColumnIdentifier = ColumnIdentifier

@typing_extensions.final
class Expression(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    COLUMN_IDENTIFIER_FIELD_NUMBER: builtins.int
    LITERAL_FIELD_NUMBER: builtins.int
    @property
    def column_identifier(self) -> global___ColumnIdentifier: ...
    @property
    def literal(self) -> protos.literal_pb2.Literal: ...
    def __init__(
        self,
        *,
        column_identifier: global___ColumnIdentifier | None = ...,
        literal: protos.literal_pb2.Literal | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["column_identifier", b"column_identifier", "literal", b"literal", "value", b"value"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["column_identifier", b"column_identifier", "literal", b"literal", "value", b"value"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["value", b"value"]) -> typing_extensions.Literal["column_identifier", "literal"] | None: ...

global___Expression = Expression

@typing_extensions.final
class Filter(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    LHS_FIELD_NUMBER: builtins.int
    OP_FIELD_NUMBER: builtins.int
    RHS_FIELD_NUMBER: builtins.int
    FILTERS_FIELD_NUMBER: builtins.int
    @property
    def lhs(self) -> global___Expression: ...
    op: protos.base_pb2.Op.ValueType
    @property
    def rhs(self) -> global___Expression: ...
    @property
    def filters(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___Filter]: ...
    def __init__(
        self,
        *,
        lhs: global___Expression | None = ...,
        op: protos.base_pb2.Op.ValueType = ...,
        rhs: global___Expression | None = ...,
        filters: collections.abc.Iterable[global___Filter] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["lhs", b"lhs", "rhs", b"rhs"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["filters", b"filters", "lhs", b"lhs", "op", b"op", "rhs", b"rhs"]) -> None: ...

global___Filter = Filter

@typing_extensions.final
class QueryRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    CONTEXT_FIELD_NUMBER: builtins.int
    FILTER_FIELD_NUMBER: builtins.int
    context: protos.base_pb2.Context.ValueType
    @property
    def filter(self) -> global___Filter: ...
    def __init__(
        self,
        *,
        context: protos.base_pb2.Context.ValueType = ...,
        filter: global___Filter | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["filter", b"filter"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["context", b"context", "filter", b"filter"]) -> None: ...

global___QueryRequest = QueryRequest

@typing_extensions.final
class ColumnOption(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    NAME_FIELD_NUMBER: builtins.int
    ALIAS_FIELD_NUMBER: builtins.int
    TYPE_FIELD_NUMBER: builtins.int
    OPTIONS_FIELD_NUMBER: builtins.int
    @property
    def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def alias(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    type: protos.literal_pb2.LiteralType.ValueType
    @property
    def options(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.literal_pb2.Literal]: ...
    def __init__(
        self,
        *,
        name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        alias: google.protobuf.wrappers_pb2.StringValue | None = ...,
        type: protos.literal_pb2.LiteralType.ValueType = ...,
        options: collections.abc.Iterable[protos.literal_pb2.Literal] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["alias", b"alias", "name", b"name"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["alias", b"alias", "name", b"name", "options", b"options", "type", b"type"]) -> None: ...

global___ColumnOption = ColumnOption

@typing_extensions.final
class QueryOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    COLUMN_OPTIONS_FIELD_NUMBER: builtins.int
    @property
    def column_options(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___ColumnOption]: ...
    def __init__(
        self,
        *,
        column_options: collections.abc.Iterable[global___ColumnOption] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["column_options", b"column_options"]) -> None: ...

global___QueryOptions = QueryOptions