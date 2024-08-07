# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/playbooks/source_task_definitions/cloudwatch_task.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n>protos/playbooks/source_task_definitions/cloudwatch_task.proto\x12\x10protos.playbooks\x1a\x1egoogle/protobuf/wrappers.proto\"\xf5\x06\n\nCloudwatch\x12\x33\n\x04type\x18\x01 \x01(\x0e\x32%.protos.playbooks.Cloudwatch.TaskType\x12H\n\x10metric_execution\x18\x02 \x01(\x0b\x32,.protos.playbooks.Cloudwatch.MetricExecutionH\x00\x12I\n\x11\x66ilter_log_events\x18\x03 \x01(\x0b\x32,.protos.playbooks.Cloudwatch.FilterLogEventsH\x00\x1a\xa2\x03\n\x0fMetricExecution\x12/\n\tnamespace\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x06region\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bmetric_name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12J\n\ndimensions\x18\x04 \x03(\x0b\x32\x36.protos.playbooks.Cloudwatch.MetricExecution.Dimension\x12/\n\tstatistic\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x1a\n\x12timeseries_offsets\x18\x06 \x03(\r\x1a\x64\n\tDimension\x12*\n\x04name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05value\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\xa9\x01\n\x0f\x46ilterLogEvents\x12,\n\x06region\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x0elog_group_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x32\n\x0c\x66ilter_query\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"D\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x14\n\x10METRIC_EXECUTION\x10\x01\x12\x15\n\x11\x46ILTER_LOG_EVENTS\x10\x02\x42\x06\n\x04taskb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.playbooks.source_task_definitions.cloudwatch_task_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _CLOUDWATCH._serialized_start=117
  _CLOUDWATCH._serialized_end=1002
  _CLOUDWATCH_METRICEXECUTION._serialized_start=334
  _CLOUDWATCH_METRICEXECUTION._serialized_end=752
  _CLOUDWATCH_METRICEXECUTION_DIMENSION._serialized_start=652
  _CLOUDWATCH_METRICEXECUTION_DIMENSION._serialized_end=752
  _CLOUDWATCH_FILTERLOGEVENTS._serialized_start=755
  _CLOUDWATCH_FILTERLOGEVENTS._serialized_end=924
  _CLOUDWATCH_TASKTYPE._serialized_start=926
  _CLOUDWATCH_TASKTYPE._serialized_end=994
# @@protoc_insertion_point(module_scope)
