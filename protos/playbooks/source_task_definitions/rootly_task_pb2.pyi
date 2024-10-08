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
class Rootly(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    class _TaskType:
        ValueType = typing.NewType("ValueType", builtins.int)
        V: typing_extensions.TypeAlias = ValueType

    class _TaskTypeEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[Rootly._TaskType.ValueType], builtins.type):  # noqa: F821
        DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
        UNKNOWN: Rootly._TaskType.ValueType  # 0
        SEND_TIMELINE_EVENT: Rootly._TaskType.ValueType  # 1

    class TaskType(_TaskType, metaclass=_TaskTypeEnumTypeWrapper): ...
    UNKNOWN: Rootly.TaskType.ValueType  # 0
    SEND_TIMELINE_EVENT: Rootly.TaskType.ValueType  # 1

    @typing_extensions.final
    class SendTimelineEvent(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        INCIDENT_ID_FIELD_NUMBER: builtins.int
        CONTENT_FIELD_NUMBER: builtins.int
        @property
        def incident_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        @property
        def content(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        def __init__(
            self,
            *,
            incident_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
            content: google.protobuf.wrappers_pb2.StringValue | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["content", b"content", "incident_id", b"incident_id"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["content", b"content", "incident_id", b"incident_id"]) -> None: ...

    TYPE_FIELD_NUMBER: builtins.int
    SEND_TIMELINE_EVENT_FIELD_NUMBER: builtins.int
    type: global___Rootly.TaskType.ValueType
    @property
    def send_timeline_event(self) -> global___Rootly.SendTimelineEvent: ...
    def __init__(
        self,
        *,
        type: global___Rootly.TaskType.ValueType = ...,
        send_timeline_event: global___Rootly.SendTimelineEvent | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["send_timeline_event", b"send_timeline_event", "task", b"task"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["send_timeline_event", b"send_timeline_event", "task", b"task", "type", b"type"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["task", b"task"]) -> typing_extensions.Literal["send_timeline_event"] | None: ...

global___Rootly = Rootly
