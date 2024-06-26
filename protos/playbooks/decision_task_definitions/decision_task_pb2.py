# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/playbooks/decision_task_definitions/decision_task.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from protos import base_pb2 as protos_dot_base__pb2
from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2
from protos.playbooks import playbook_commons_pb2 as protos_dot_playbooks_dot_playbook__commons__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n>protos/playbooks/decision_task_definitions/decision_task.proto\x12\x10protos.playbooks\x1a\x11protos/base.proto\x1a\x1egoogle/protobuf/wrappers.proto\x1a\'protos/playbooks/playbook_commons.proto\"\xeb\x05\n\x18TimeseriesEvaluationTask\x12>\n\x05rules\x18\x01 \x03(\x0b\x32/.protos.playbooks.TimeseriesEvaluationTask.Rule\x12H\n\ninput_type\x18\x02 \x01(\x0e\x32\x34.protos.playbooks.TimeseriesEvaluationTask.InputType\x12>\n\x10timeseries_input\x18\x03 \x01(\x0b\x32\".protos.playbooks.TimeseriesResultH\x00\x1a\xca\x03\n\x04Rule\x12\x42\n\x04type\x18\x01 \x01(\x0e\x32\x34.protos.playbooks.TimeseriesEvaluationTask.Rule.Type\x12?\n\x08\x66unction\x18\x02 \x01(\x0e\x32-.protos.playbooks.EvaluationConditionFunction\x12?\n\x08operator\x18\x03 \x01(\x0e\x32-.protos.playbooks.EvaluationConditionOperator\x12,\n\x06window\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.DoubleValue\x12/\n\tthreshold\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.DoubleValue\x12/\n\tnext_task\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x0clabel_values\x18\x07 \x03(\x0b\x32 .protos.playbooks.LabelValuePair\"4\n\x04Type\x12\x0f\n\x0bUNKNOWN_TEC\x10\x00\x12\x0b\n\x07ROLLING\x10\x01\x12\x0e\n\nCUMULATIVE\x10\x02\"/\n\tInputType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x15\n\x11METRIC_TIMESERIES\x10\x01\x42\x07\n\x05input\"E\n\x12\x45lseEvaluationTask\x12/\n\tnext_task\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue*b\n\x1b\x45valuationConditionFunction\x12\x0f\n\x0bUNKNOWN_ECF\x10\x00\x12\x0b\n\x07\x45\x43\x46_AVG\x10\x01\x12\x0b\n\x07\x45\x43\x46_SUM\x10\x02\x12\x0b\n\x07\x45\x43\x46_MIN\x10\x03\x12\x0b\n\x07\x45\x43\x46_MAX\x10\x04*\x96\x01\n\x1b\x45valuationConditionOperator\x12\x0f\n\x0bUNKNOWN_ECO\x10\x00\x12\x10\n\x0cGREATER_THAN\x10\x01\x12\r\n\tLESS_THAN\x10\x02\x12\x16\n\x12GREATER_THAN_EQUAL\x10\x03\x12\x13\n\x0fLESS_THAN_EQUAL\x10\x04\x12\t\n\x05\x45QUAL\x10\x05\x12\r\n\tNOT_EQUAL\x10\x06\x62\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.playbooks.decision_task_definitions.decision_task_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _EVALUATIONCONDITIONFUNCTION._serialized_start=997
  _EVALUATIONCONDITIONFUNCTION._serialized_end=1095
  _EVALUATIONCONDITIONOPERATOR._serialized_start=1098
  _EVALUATIONCONDITIONOPERATOR._serialized_end=1248
  _TIMESERIESEVALUATIONTASK._serialized_start=177
  _TIMESERIESEVALUATIONTASK._serialized_end=924
  _TIMESERIESEVALUATIONTASK_RULE._serialized_start=408
  _TIMESERIESEVALUATIONTASK_RULE._serialized_end=866
  _TIMESERIESEVALUATIONTASK_RULE_TYPE._serialized_start=814
  _TIMESERIESEVALUATIONTASK_RULE_TYPE._serialized_end=866
  _TIMESERIESEVALUATIONTASK_INPUTTYPE._serialized_start=868
  _TIMESERIESEVALUATIONTASK_INPUTTYPE._serialized_end=915
  _ELSEEVALUATIONTASK._serialized_start=926
  _ELSEEVALUATIONTASK._serialized_end=995
# @@protoc_insertion_point(module_scope)
