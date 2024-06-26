# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/connectors/assets/grafana_asset.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2
from protos import base_pb2 as protos_dot_base__pb2
from protos.connectors import connector_pb2 as protos_dot_connectors_dot_connector__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n,protos/connectors/assets/grafana_asset.proto\x12\x18protos.connectors.assets\x1a\x1egoogle/protobuf/wrappers.proto\x1a\x11protos/base.proto\x1a!protos/connectors/connector.proto\"\x95\t\n#GrafanaTargetMetricPromQlAssetModel\x12\x32\n\x0c\x64\x61shboard_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61shboard_title\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x33\n\rdashboard_url\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x66\n\x10panel_promql_map\x18\x04 \x03(\x0b\x32L.protos.connectors.assets.GrafanaTargetMetricPromQlAssetModel.PanelPromqlMap\x1a\x8b\x05\n\x0cPromqlMetric\x12:\n\x14target_metric_ref_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x0e\x64\x61tasource_uid\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x30\n\nexpression\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12|\n\x12label_variable_map\x18\x04 \x03(\x0b\x32`.protos.connectors.assets.GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryLabelVariableMap\x12\x85\x01\n\x17variable_values_options\x18\x05 \x03(\x0b\x32\x64.protos.connectors.assets.GrafanaTargetMetricPromQlAssetModel.PromqlMetric.QueryVariableValueOptions\x1a[\n\x19QueryVariableValueOptions\x12.\n\x08variable\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x0e\n\x06values\x18\x02 \x03(\t\x1at\n\x15QueryLabelVariableMap\x12+\n\x05label\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12.\n\x08variable\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\xd7\x01\n\x0ePanelPromqlMap\x12.\n\x08panel_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bpanel_title\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x62\n\x0epromql_metrics\x18\x03 \x03(\x0b\x32J.protos.connectors.assets.GrafanaTargetMetricPromQlAssetModel.PromqlMetric\"\xc0\x05\n\x1bGrafanaDatasourceAssetModel\x12\x33\n\rdatasource_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x34\n\x0e\x64\x61tasource_uid\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x0e\x64\x61tasource_url\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61tasource_name\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61tasource_type\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10\x64\x61tasource_orgId\x18\x07 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x37\n\x11\x64\x61tasource_access\x18\x08 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x39\n\x13\x64\x61tasource_database\x18\t \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x37\n\x13\x64\x61tasource_readonly\x18\n \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12\x39\n\x13\x64\x61tasource_typeName\x18\x0b \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x38\n\x14\x64\x61tasource_basicAuth\x18\x0c \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12\x38\n\x14\x64\x61tasource_isDefault\x18\r \x01(\x0b\x32\x1a.google.protobuf.BoolValue\"\xcf\x04\n%GrafanaTargetMetricPromQlAssetOptions\x12k\n\ndashboards\x18\x01 \x03(\x0b\x32W.protos.connectors.assets.GrafanaTargetMetricPromQlAssetOptions.GrafanaDashboardOptions\x1a\xb8\x03\n\x17GrafanaDashboardOptions\x12\x32\n\x0c\x64\x61shboard_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61shboard_title\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x33\n\rdashboard_url\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x82\x01\n\rpanel_options\x18\x04 \x03(\x0b\x32k.protos.connectors.assets.GrafanaTargetMetricPromQlAssetOptions.GrafanaDashboardOptions.GrafanaPanelOptions\x1ax\n\x13GrafanaPanelOptions\x12.\n\x08panel_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bpanel_title\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xd0\x02\n\x1dGrafanaDatasourceAssetOptions\x12p\n\x16prometheus_datasources\x18\x01 \x03(\x0b\x32P.protos.connectors.assets.GrafanaDatasourceAssetOptions.GrafanaDatasourceOptions\x1a\xbc\x01\n\x18GrafanaDatasourceOptions\x12\x33\n\rdatasource_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x34\n\x0e\x64\x61tasource_uid\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61tasource_name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xf2\x02\n\x11GrafanaAssetModel\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12&\n\x0e\x63onnector_type\x18\x02 \x01(\x0e\x32\x0e.protos.Source\x12%\n\x04type\x18\x03 \x01(\x0e\x32\x17.protos.SourceModelType\x12\x14\n\x0clast_updated\x18\x04 \x01(\x10\x12\x65\n\x1cgrafana_target_metric_promql\x18\x05 \x01(\x0b\x32=.protos.connectors.assets.GrafanaTargetMetricPromQlAssetModelH\x00\x12^\n\x1dgrafana_prometheus_datasource\x18\x06 \x01(\x0b\x32\x35.protos.connectors.assets.GrafanaDatasourceAssetModelH\x00\x42\x07\n\x05\x61sset\"L\n\rGrafanaAssets\x12;\n\x06\x61ssets\x18\x01 \x03(\x0b\x32+.protos.connectors.assets.GrafanaAssetModelb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.connectors.assets.grafana_asset_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _GRAFANATARGETMETRICPROMQLASSETMODEL._serialized_start=161
  _GRAFANATARGETMETRICPROMQLASSETMODEL._serialized_end=1334
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC._serialized_start=465
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC._serialized_end=1116
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC_QUERYVARIABLEVALUEOPTIONS._serialized_start=907
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC_QUERYVARIABLEVALUEOPTIONS._serialized_end=998
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC_QUERYLABELVARIABLEMAP._serialized_start=1000
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PROMQLMETRIC_QUERYLABELVARIABLEMAP._serialized_end=1116
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PANELPROMQLMAP._serialized_start=1119
  _GRAFANATARGETMETRICPROMQLASSETMODEL_PANELPROMQLMAP._serialized_end=1334
  _GRAFANADATASOURCEASSETMODEL._serialized_start=1337
  _GRAFANADATASOURCEASSETMODEL._serialized_end=2041
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS._serialized_start=2044
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS._serialized_end=2635
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS_GRAFANADASHBOARDOPTIONS._serialized_start=2195
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS_GRAFANADASHBOARDOPTIONS._serialized_end=2635
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS_GRAFANADASHBOARDOPTIONS_GRAFANAPANELOPTIONS._serialized_start=2515
  _GRAFANATARGETMETRICPROMQLASSETOPTIONS_GRAFANADASHBOARDOPTIONS_GRAFANAPANELOPTIONS._serialized_end=2635
  _GRAFANADATASOURCEASSETOPTIONS._serialized_start=2638
  _GRAFANADATASOURCEASSETOPTIONS._serialized_end=2974
  _GRAFANADATASOURCEASSETOPTIONS_GRAFANADATASOURCEOPTIONS._serialized_start=2786
  _GRAFANADATASOURCEASSETOPTIONS_GRAFANADATASOURCEOPTIONS._serialized_end=2974
  _GRAFANAASSETMODEL._serialized_start=2977
  _GRAFANAASSETMODEL._serialized_end=3347
  _GRAFANAASSETS._serialized_start=3349
  _GRAFANAASSETS._serialized_end=3425
# @@protoc_insertion_point(module_scope)
