# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/connectors/Events/pagerduty.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n(protos/connectors/Events/pagerduty.proto\x12\x18protos.connectors.assets\x1a\x1egoogle/protobuf/wrappers.proto\"\xdc\x01\n\x16PagerDutyIncidentModel\x12\x31\n\x0bincident_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05title\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x30\n\nservice_id\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x30\n\ncreated_at\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xd3\x01\n\x13PagerDutyAlertModel\x12.\n\x08\x61lert_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bincident_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07summary\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12*\n\x04\x62ody\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\x95\x01\n\x0fPagerDutyAssets\x12\x43\n\tincidents\x18\x01 \x03(\x0b\x32\x30.protos.connectors.assets.PagerDutyIncidentModel\x12=\n\x06\x61lerts\x18\x02 \x03(\x0b\x32-.protos.connectors.assets.PagerDutyAlertModelb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.connectors.Events.pagerduty_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _PAGERDUTYINCIDENTMODEL._serialized_start=103
  _PAGERDUTYINCIDENTMODEL._serialized_end=323
  _PAGERDUTYALERTMODEL._serialized_start=326
  _PAGERDUTYALERTMODEL._serialized_end=537
  _PAGERDUTYASSETS._serialized_start=540
  _PAGERDUTYASSETS._serialized_end=689
# @@protoc_insertion_point(module_scope)
