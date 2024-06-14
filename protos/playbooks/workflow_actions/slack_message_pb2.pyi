"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import google.protobuf.descriptor
import google.protobuf.message
import google.protobuf.wrappers_pb2
import sys

if sys.version_info >= (3, 8):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class SlackMessageWorkflowAction(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    SLACK_CHANNEL_ID_FIELD_NUMBER: builtins.int
    @property
    def slack_channel_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    def __init__(
        self,
        *,
        slack_channel_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["slack_channel_id", b"slack_channel_id"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["slack_channel_id", b"slack_channel_id"]) -> None: ...

global___SlackMessageWorkflowAction = SlackMessageWorkflowAction
