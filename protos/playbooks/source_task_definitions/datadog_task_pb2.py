# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/playbooks/source_task_definitions/datadog_task.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n;protos/playbooks/source_task_definitions/datadog_task.proto\x12\x10protos.playbooks\x1a\x1egoogle/protobuf/wrappers.proto\"\xc8\x05\n\x07\x44\x61tadog\x12\x30\n\x04type\x18\x01 \x01(\x0e\x32\".protos.playbooks.Datadog.TaskType\x12X\n\x18service_metric_execution\x18\x02 \x01(\x0b\x32\x34.protos.playbooks.Datadog.ServiceMetricExecutionTaskH\x00\x12T\n\x16query_metric_execution\x18\x03 \x01(\x0b\x32\x32.protos.playbooks.Datadog.QueryMetricExecutionTaskH\x00\x1a\x87\x02\n\x1aServiceMetricExecutionTask\x12\x32\n\x0cservice_name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10\x65nvironment_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x33\n\rmetric_family\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x06metric\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x1a\n\x12timeseries_offsets\x18\x05 \x03(\r\x1av\n\x18QueryMetricExecutionTask\x12\x0f\n\x07queries\x18\x01 \x03(\t\x12-\n\x07\x66ormula\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x1a\n\x12timeseries_offsets\x18\x03 \x03(\r\"Q\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x1c\n\x18SERVICE_METRIC_EXECUTION\x10\x01\x12\x1a\n\x16QUERY_METRIC_EXECUTION\x10\x02\x42\x06\n\x04taskb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.playbooks.source_task_definitions.datadog_task_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _DATADOG._serialized_start=114
  _DATADOG._serialized_end=826
  _DATADOG_SERVICEMETRICEXECUTIONTASK._serialized_start=352
  _DATADOG_SERVICEMETRICEXECUTIONTASK._serialized_end=615
  _DATADOG_QUERYMETRICEXECUTIONTASK._serialized_start=617
  _DATADOG_QUERYMETRICEXECUTIONTASK._serialized_end=735
  _DATADOG_TASKTYPE._serialized_start=737
  _DATADOG_TASKTYPE._serialized_end=818
# @@protoc_insertion_point(module_scope)
