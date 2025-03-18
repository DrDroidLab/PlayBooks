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
import sys

if sys.version_info >= (3, 8):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class JiraUserAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ACCOUNT_ID_FIELD_NUMBER: builtins.int
    DISPLAY_NAME_FIELD_NUMBER: builtins.int
    SELF_URL_FIELD_NUMBER: builtins.int
    @property
    def account_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def display_name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def self_url(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    def __init__(
        self,
        *,
        account_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
        display_name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        self_url: google.protobuf.wrappers_pb2.StringValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["account_id", b"account_id", "display_name", b"display_name", "self_url", b"self_url"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["account_id", b"account_id", "display_name", b"display_name", "self_url", b"self_url"]) -> None: ...

global___JiraUserAssetModel = JiraUserAssetModel

@typing_extensions.final
class JiraUserAssetOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    DISPLAY_NAMES_FIELD_NUMBER: builtins.int
    @property
    def display_names(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    def __init__(
        self,
        *,
        display_names: collections.abc.Iterable[builtins.str] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["display_names", b"display_names"]) -> None: ...

global___JiraUserAssetOptions = JiraUserAssetOptions

@typing_extensions.final
class JiraProjectAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    KEY_FIELD_NUMBER: builtins.int
    NAME_FIELD_NUMBER: builtins.int
    SELF_URL_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def key(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def self_url(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.StringValue | None = ...,
        key: google.protobuf.wrappers_pb2.StringValue | None = ...,
        name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        self_url: google.protobuf.wrappers_pb2.StringValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["id", b"id", "key", b"key", "name", b"name", "self_url", b"self_url"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["id", b"id", "key", b"key", "name", b"name", "self_url", b"self_url"]) -> None: ...

global___JiraProjectAssetModel = JiraProjectAssetModel

@typing_extensions.final
class JiraProjectAssetOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    NAMES_FIELD_NUMBER: builtins.int
    @property
    def names(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    def __init__(
        self,
        *,
        names: collections.abc.Iterable[builtins.str] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["names", b"names"]) -> None: ...

global___JiraProjectAssetOptions = JiraProjectAssetOptions

@typing_extensions.final
class JiraAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    CONNECTOR_TYPE_FIELD_NUMBER: builtins.int
    TYPE_FIELD_NUMBER: builtins.int
    LAST_UPDATED_FIELD_NUMBER: builtins.int
    JIRA_PROJECT_FIELD_NUMBER: builtins.int
    JIRA_USER_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    connector_type: protos.base_pb2.Source.ValueType
    type: protos.base_pb2.SourceModelType.ValueType
    last_updated: builtins.int
    @property
    def jira_project(self) -> global___JiraProjectAssetModel: ...
    @property
    def jira_user(self) -> global___JiraUserAssetModel: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        connector_type: protos.base_pb2.Source.ValueType = ...,
        type: protos.base_pb2.SourceModelType.ValueType = ...,
        last_updated: builtins.int = ...,
        jira_project: global___JiraProjectAssetModel | None = ...,
        jira_user: global___JiraUserAssetModel | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["asset", b"asset", "id", b"id", "jira_project", b"jira_project", "jira_user", b"jira_user"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["asset", b"asset", "connector_type", b"connector_type", "id", b"id", "jira_project", b"jira_project", "jira_user", b"jira_user", "last_updated", b"last_updated", "type", b"type"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["asset", b"asset"]) -> typing_extensions.Literal["jira_project", "jira_user"] | None: ...

global___JiraAssetModel = JiraAssetModel

@typing_extensions.final
class JiraAssets(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ASSETS_FIELD_NUMBER: builtins.int
    @property
    def assets(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___JiraAssetModel]: ...
    def __init__(
        self,
        *,
        assets: collections.abc.Iterable[global___JiraAssetModel] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["assets", b"assets"]) -> None: ...

global___JiraAssets = JiraAssets
