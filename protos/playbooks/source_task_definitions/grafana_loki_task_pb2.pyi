"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import google.protobuf.descriptor
import google.protobuf.internal.enum_type_wrapper
import google.protobuf.message
import google.protobuf.wrappers_pb2
import sys
import typing

if sys.version_info >= (3, 10):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class GrafanaLoki(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    class _TaskType:
        ValueType = typing.NewType("ValueType", builtins.int)
        V: typing_extensions.TypeAlias = ValueType

    class _TaskTypeEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[GrafanaLoki._TaskType.ValueType], builtins.type):  # noqa: F821
        DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
        UNKNOWN: GrafanaLoki._TaskType.ValueType  # 0
        QUERY_LOGS: GrafanaLoki._TaskType.ValueType  # 1

    class TaskType(_TaskType, metaclass=_TaskTypeEnumTypeWrapper): ...
    UNKNOWN: GrafanaLoki.TaskType.ValueType  # 0
    QUERY_LOGS: GrafanaLoki.TaskType.ValueType  # 1

    @typing_extensions.final
    class QueryLogs(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        QUERY_FIELD_NUMBER: builtins.int
        START_TIME_FIELD_NUMBER: builtins.int
        END_TIME_FIELD_NUMBER: builtins.int
        LIMIT_FIELD_NUMBER: builtins.int
        @property
        def query(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        @property
        def start_time(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
        @property
        def end_time(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
        @property
        def limit(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
        def __init__(
            self,
            *,
            query: google.protobuf.wrappers_pb2.StringValue | None = ...,
            start_time: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
            end_time: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
            limit: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["end_time", b"end_time", "limit", b"limit", "query", b"query", "start_time", b"start_time"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["end_time", b"end_time", "limit", b"limit", "query", b"query", "start_time", b"start_time"]) -> None: ...

    TYPE_FIELD_NUMBER: builtins.int
    QUERY_LOGS_FIELD_NUMBER: builtins.int
    type: global___GrafanaLoki.TaskType.ValueType
    @property
    def query_logs(self) -> global___GrafanaLoki.QueryLogs: ...
    def __init__(
        self,
        *,
        type: global___GrafanaLoki.TaskType.ValueType = ...,
        query_logs: global___GrafanaLoki.QueryLogs | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["query_logs", b"query_logs", "task", b"task"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["query_logs", b"query_logs", "task", b"task", "type", b"type"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["task", b"task"]) -> typing_extensions.Literal["query_logs"] | None: ...

global___GrafanaLoki = GrafanaLoki
