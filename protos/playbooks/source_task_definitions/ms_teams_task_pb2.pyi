"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import google.protobuf.descriptor
import google.protobuf.internal.enum_type_wrapper
import google.protobuf.message
import google.protobuf.struct_pb2
import google.protobuf.wrappers_pb2
import sys
import typing

if sys.version_info >= (3, 10):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class MSTeams(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    class _TaskType:
        ValueType = typing.NewType("ValueType", builtins.int)
        V: typing_extensions.TypeAlias = ValueType

    class _TaskTypeEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[MSTeams._TaskType.ValueType], builtins.type):  # noqa: F821
        DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
        UNKNOWN: MSTeams._TaskType.ValueType  # 0
        SEND_MESSAGE_WEBHOOK: MSTeams._TaskType.ValueType  # 1

    class TaskType(_TaskType, metaclass=_TaskTypeEnumTypeWrapper): ...
    UNKNOWN: MSTeams.TaskType.ValueType  # 0
    SEND_MESSAGE_WEBHOOK: MSTeams.TaskType.ValueType  # 1

    @typing_extensions.final
    class SendMessageWebhook(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        WEBHOOK_FIELD_NUMBER: builtins.int
        PAYLOAD_FIELD_NUMBER: builtins.int
        @property
        def webhook(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        @property
        def payload(self) -> google.protobuf.struct_pb2.Struct: ...
        def __init__(
            self,
            *,
            webhook: google.protobuf.wrappers_pb2.StringValue | None = ...,
            payload: google.protobuf.struct_pb2.Struct | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["payload", b"payload", "webhook", b"webhook"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["payload", b"payload", "webhook", b"webhook"]) -> None: ...

    TYPE_FIELD_NUMBER: builtins.int
    SEND_MESSAGE_WEBHOOK_FIELD_NUMBER: builtins.int
    type: global___MSTeams.TaskType.ValueType
    @property
    def send_message_webhook(self) -> global___MSTeams.SendMessageWebhook: ...
    def __init__(
        self,
        *,
        type: global___MSTeams.TaskType.ValueType = ...,
        send_message_webhook: global___MSTeams.SendMessageWebhook | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["send_message_webhook", b"send_message_webhook", "task", b"task"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["send_message_webhook", b"send_message_webhook", "task", b"task", "type", b"type"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["task", b"task"]) -> typing_extensions.Literal["send_message_webhook"] | None: ...

global___MSTeams = MSTeams