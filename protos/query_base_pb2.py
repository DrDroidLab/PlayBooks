# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/query_base.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2
from protos import base_pb2 as protos_dot_base__pb2
from protos import literal_pb2 as protos_dot_literal__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x17protos/query_base.proto\x12\x06protos\x1a\x1egoogle/protobuf/wrappers.proto\x1a\x11protos/base.proto\x1a\x14protos/literal.proto\"\xad\x01\n\x12GlobalQueryOptions\x12.\n\x0fop_descriptions\x18\x01 \x03(\x0b\x32\x15.protos.OpDescription\x12%\n\nop_mapping\x18\x02 \x03(\x0b\x32\x11.protos.OpMapping\x12@\n\x18literal_type_description\x18\x03 \x03(\x0b\x32\x1e.protos.LiteralTypeDescription\"A\n\x05OpRhs\x12\x16\n\x02op\x18\x01 \x01(\x0e\x32\n.protos.Op\x12 \n\x03rhs\x18\x02 \x01(\x0e\x32\x13.protos.LiteralType\"L\n\tOpMapping\x12 \n\x03lhs\x18\x01 \x01(\x0e\x32\x13.protos.LiteralType\x12\x1d\n\x06op_rhs\x18\x02 \x03(\x0b\x32\r.protos.OpRhs\"C\n\x10\x43olumnIdentifier\x12\x0c\n\x04name\x18\x01 \x01(\t\x12!\n\x04type\x18\x02 \x01(\x0e\x32\x13.protos.LiteralType\"p\n\nExpression\x12\x35\n\x11\x63olumn_identifier\x18\x01 \x01(\x0b\x32\x18.protos.ColumnIdentifierH\x00\x12\"\n\x07literal\x18\x02 \x01(\x0b\x32\x0f.protos.LiteralH\x00\x42\x07\n\x05value\"\x83\x01\n\x06\x46ilter\x12\x1f\n\x03lhs\x18\x01 \x01(\x0b\x32\x12.protos.Expression\x12\x16\n\x02op\x18\x02 \x01(\x0e\x32\n.protos.Op\x12\x1f\n\x03rhs\x18\x03 \x01(\x0b\x32\x12.protos.Expression\x12\x1f\n\x07\x66ilters\x18\x04 \x03(\x0b\x32\x0e.protos.Filter\"P\n\x0cQueryRequest\x12 \n\x07\x63ontext\x18\x01 \x01(\x0e\x32\x0f.protos.Context\x12\x1e\n\x06\x66ilter\x18\x02 \x01(\x0b\x32\x0e.protos.Filter\"\xac\x01\n\x0c\x43olumnOption\x12*\n\x04name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05\x61lias\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12!\n\x04type\x18\x03 \x01(\x0e\x32\x13.protos.LiteralType\x12 \n\x07options\x18\x04 \x03(\x0b\x32\x0f.protos.Literal\"<\n\x0cQueryOptions\x12,\n\x0e\x63olumn_options\x18\x01 \x03(\x0b\x32\x14.protos.ColumnOptionb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.query_base_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _GLOBALQUERYOPTIONS._serialized_start=109
  _GLOBALQUERYOPTIONS._serialized_end=282
  _OPRHS._serialized_start=284
  _OPRHS._serialized_end=349
  _OPMAPPING._serialized_start=351
  _OPMAPPING._serialized_end=427
  _COLUMNIDENTIFIER._serialized_start=429
  _COLUMNIDENTIFIER._serialized_end=496
  _EXPRESSION._serialized_start=498
  _EXPRESSION._serialized_end=610
  _FILTER._serialized_start=613
  _FILTER._serialized_end=744
  _QUERYREQUEST._serialized_start=746
  _QUERYREQUEST._serialized_end=826
  _COLUMNOPTION._serialized_start=829
  _COLUMNOPTION._serialized_end=1001
  _QUERYOPTIONS._serialized_start=1003
  _QUERYOPTIONS._serialized_end=1063
# @@protoc_insertion_point(module_scope)
