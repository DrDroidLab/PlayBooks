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
class GcmLogSinkAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    PROJECT_ID_FIELD_NUMBER: builtins.int
    LOG_SINKS_FIELD_NUMBER: builtins.int
    @property
    def project_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def log_sinks(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    def __init__(
        self,
        *,
        project_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
        log_sinks: collections.abc.Iterable[builtins.str] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["project_id", b"project_id"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["log_sinks", b"log_sinks", "project_id", b"project_id"]) -> None: ...

global___GcmLogSinkAssetModel = GcmLogSinkAssetModel

@typing_extensions.final
class GcmLogSinkAssetOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    PROJECT_IDS_FIELD_NUMBER: builtins.int
    @property
    def project_ids(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    def __init__(
        self,
        *,
        project_ids: collections.abc.Iterable[builtins.str] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["project_ids", b"project_ids"]) -> None: ...

global___GcmLogSinkAssetOptions = GcmLogSinkAssetOptions

@typing_extensions.final
class GcmMetricAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    @typing_extensions.final
    class MetricLabel(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        NAME_FIELD_NUMBER: builtins.int
        VALUES_FIELD_NUMBER: builtins.int
        METRICS_FIELD_NUMBER: builtins.int
        @property
        def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        @property
        def values(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
        @property
        def metrics(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
        def __init__(
            self,
            *,
            name: google.protobuf.wrappers_pb2.StringValue | None = ...,
            values: collections.abc.Iterable[builtins.str] | None = ...,
            metrics: collections.abc.Iterable[builtins.str] | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["name", b"name"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["metrics", b"metrics", "name", b"name", "values", b"values"]) -> None: ...

    METRIC_TYPE_FIELD_NUMBER: builtins.int
    LABEL_VALUE_METRIC_MAP_FIELD_NUMBER: builtins.int
    @property
    def metric_type(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def label_value_metric_map(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___GcmMetricAssetModel.MetricLabel]: ...
    def __init__(
        self,
        *,
        metric_type: google.protobuf.wrappers_pb2.StringValue | None = ...,
        label_value_metric_map: collections.abc.Iterable[global___GcmMetricAssetModel.MetricLabel] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["metric_type", b"metric_type"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["label_value_metric_map", b"label_value_metric_map", "metric_type", b"metric_type"]) -> None: ...

global___GcmMetricAssetModel = GcmMetricAssetModel

@typing_extensions.final
class GcmMetricAssetOptions(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    METRIC_TYPES_FIELD_NUMBER: builtins.int
    @property
    def metric_types(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    def __init__(
        self,
        *,
        metric_types: collections.abc.Iterable[builtins.str] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["metric_types", b"metric_types"]) -> None: ...

global___GcmMetricAssetOptions = GcmMetricAssetOptions

@typing_extensions.final
class GcmAssetModel(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    CONNECTOR_TYPE_FIELD_NUMBER: builtins.int
    TYPE_FIELD_NUMBER: builtins.int
    LAST_UPDATED_FIELD_NUMBER: builtins.int
    GCM_LOG_SINK_FIELD_NUMBER: builtins.int
    GCM_METRIC_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    connector_type: protos.base_pb2.Source.ValueType
    type: protos.base_pb2.SourceModelType.ValueType
    last_updated: builtins.int
    @property
    def gcm_log_sink(self) -> global___GcmLogSinkAssetModel: ...
    @property
    def gcm_metric(self) -> global___GcmMetricAssetModel: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        connector_type: protos.base_pb2.Source.ValueType = ...,
        type: protos.base_pb2.SourceModelType.ValueType = ...,
        last_updated: builtins.int = ...,
        gcm_log_sink: global___GcmLogSinkAssetModel | None = ...,
        gcm_metric: global___GcmMetricAssetModel | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["asset", b"asset", "gcm_log_sink", b"gcm_log_sink", "gcm_metric", b"gcm_metric", "id", b"id"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["asset", b"asset", "connector_type", b"connector_type", "gcm_log_sink", b"gcm_log_sink", "gcm_metric", b"gcm_metric", "id", b"id", "last_updated", b"last_updated", "type", b"type"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["asset", b"asset"]) -> typing_extensions.Literal["gcm_log_sink", "gcm_metric"] | None: ...

global___GcmAssetModel = GcmAssetModel

@typing_extensions.final
class GcmAssets(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ASSETS_FIELD_NUMBER: builtins.int
    @property
    def assets(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___GcmAssetModel]: ...
    def __init__(
        self,
        *,
        assets: collections.abc.Iterable[global___GcmAssetModel] | None = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["assets", b"assets"]) -> None: ...

global___GcmAssets = GcmAssets
