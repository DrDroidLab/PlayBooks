# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/connectors/assets/clickhouse_asset.proto
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


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n/protos/connectors/assets/clickhouse_asset.proto\x12\x18protos.connectors.assets\x1a\x1egoogle/protobuf/wrappers.proto\x1a\x11protos/base.proto\x1a!protos/connectors/connector.proto\"N\n\x1c\x43lickhouseDatabaseAssetModel\x12.\n\x08\x64\x61tabase\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"3\n\x1e\x43lickhouseDatabaseAssetOptions\x12\x11\n\tdatabases\x18\x01 \x03(\t\"\x85\x02\n\x14\x43lickhouseAssetModel\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12&\n\x0e\x63onnector_type\x18\x02 \x01(\x0e\x32\x0e.protos.Source\x12%\n\x04type\x18\x03 \x01(\x0e\x32\x17.protos.SourceModelType\x12\x14\n\x0clast_updated\x18\x04 \x01(\x10\x12U\n\x13\x63lickhouse_database\x18\x05 \x01(\x0b\x32\x36.protos.connectors.assets.ClickhouseDatabaseAssetModelH\x00\x42\x07\n\x05\x61sset\"R\n\x10\x43lickhouseAssets\x12>\n\x06\x61ssets\x18\x01 \x03(\x0b\x32..protos.connectors.assets.ClickhouseAssetModelb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.connectors.assets.clickhouse_asset_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _CLICKHOUSEDATABASEASSETMODEL._serialized_start=163
  _CLICKHOUSEDATABASEASSETMODEL._serialized_end=241
  _CLICKHOUSEDATABASEASSETOPTIONS._serialized_start=243
  _CLICKHOUSEDATABASEASSETOPTIONS._serialized_end=294
  _CLICKHOUSEASSETMODEL._serialized_start=297
  _CLICKHOUSEASSETMODEL._serialized_end=558
  _CLICKHOUSEASSETS._serialized_start=560
  _CLICKHOUSEASSETS._serialized_end=642
# @@protoc_insertion_point(module_scope)
