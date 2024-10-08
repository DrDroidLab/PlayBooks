# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/playbooks/api.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2
from google.protobuf import struct_pb2 as google_dot_protobuf_dot_struct__pb2
from protos import base_pb2 as protos_dot_base__pb2
from protos import query_base_pb2 as protos_dot_query__base__pb2
from protos.playbooks import deprecated_playbook_pb2 as protos_dot_playbooks_dot_deprecated__playbook__pb2
from protos.playbooks import playbook_pb2 as protos_dot_playbooks_dot_playbook__pb2
from protos.playbooks import workflow_pb2 as protos_dot_playbooks_dot_workflow__pb2
from protos.playbooks.intelligence_layer import interpreter_pb2 as protos_dot_playbooks_dot_intelligence__layer_dot_interpreter__pb2
from protos.playbooks import playbook_commons_pb2 as protos_dot_playbooks_dot_playbook__commons__pb2
from protos.playbooks.source_task_definitions import lambda_function_task_pb2 as protos_dot_playbooks_dot_source__task__definitions_dot_lambda__function__task__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x1aprotos/playbooks/api.proto\x12\x10protos.playbooks\x1a\x1egoogle/protobuf/wrappers.proto\x1a\x1cgoogle/protobuf/struct.proto\x1a\x11protos/base.proto\x1a\x17protos/query_base.proto\x1a*protos/playbooks/deprecated_playbook.proto\x1a\x1fprotos/playbooks/playbook.proto\x1a\x1fprotos/playbooks/workflow.proto\x1a\x35protos/playbooks/intelligence_layer/interpreter.proto\x1a\'protos/playbooks/playbook_commons.proto\x1a\x43protos/playbooks/source_task_definitions/lambda_function_task.proto\"\x8a\x01\n\x16RunPlaybookTaskRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12T\n\x18playbook_task_definition\x18\x02 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookTaskDefinition\"\xdc\x01\n\x17RunPlaybookTaskResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12V\n\x15task_execution_result\x18\x04 \x01(\x0b\x32\x37.protos.playbooks.DeprecatedPlaybookTaskExecutionResult\"\xd4\x01\n\x19RunPlaybookTaskResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12L\n\x12task_execution_log\x18\x04 \x01(\x0b\x32\x30.protos.playbooks.DeprecatedPlaybookExecutionLog\"\xa3\x01\n\x18RunPlaybookTaskRequestV3\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x34\n\x13global_variable_set\x18\x02 \x01(\x0b\x32\x17.google.protobuf.Struct\x12\x35\n\rplaybook_task\x18\x03 \x01(\x0b\x32\x1e.protos.playbooks.PlaybookTask\"\xd7\x01\n\x19RunPlaybookTaskResponseV3\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12O\n\x1bplaybook_task_execution_log\x18\x04 \x01(\x0b\x32*.protos.playbooks.PlaybookTaskExecutionLog\"\xda\x01\n\x1bRunBulkPlaybookTaskResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12P\n\x1cplaybook_task_execution_logs\x18\x04 \x03(\x0b\x32*.protos.playbooks.PlaybookTaskExecutionLog\"\x7f\n\x16RunPlaybookStepRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12I\n\rplaybook_step\x18\x02 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookStepDefinition\"\xbc\x02\n\x17RunPlaybookStepResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12*\n\x04name\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0b\x64\x65scription\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12W\n\x16task_execution_results\x18\x06 \x03(\x0b\x32\x37.protos.playbooks.DeprecatedPlaybookTaskExecutionResult\"\xd8\x01\n\x19RunPlaybookStepResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12P\n\x12step_execution_log\x18\x04 \x01(\x0b\x32\x34.protos.playbooks.DeprecatedPlaybookStepExecutionLog\"m\n\x18RunPlaybookStepRequestV3\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\rplaybook_step\x18\x02 \x01(\x0b\x32\x1e.protos.playbooks.PlaybookStep\"\xce\x01\n\x19RunPlaybookStepResponseV3\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x46\n\x12step_execution_log\x18\x04 \x01(\x0b\x32*.protos.playbooks.PlaybookStepExecutionLog\"h\n\x12RunPlaybookRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x36\n\x08playbook\x18\x02 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\"\xcb\x01\n\x13RunPlaybookResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12I\n\x12playbook_execution\x18\x04 \x01(\x0b\x32-.protos.playbooks.DeprecatedPlaybookExecution\"`\n\x14RunPlaybookRequestV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12,\n\x08playbook\x18\x02 \x01(\x0b\x32\x1a.protos.playbooks.Playbook\"\xc3\x01\n\x15RunPlaybookResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12?\n\x12playbook_execution\x18\x04 \x01(\x0b\x32#.protos.playbooks.PlaybookExecution\"G\n\x13GetPlaybooksRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x14\n\x0cplaybook_ids\x18\x02 \x03(\x04\"k\n\x14GetPlaybooksResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x37\n\tplaybooks\x18\x02 \x03(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\"I\n\x15GetPlaybooksRequestV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x14\n\x0cplaybook_ids\x18\x02 \x03(\x04\"c\n\x16GetPlaybooksResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12-\n\tplaybooks\x18\x02 \x03(\x0b\x32\x1a.protos.playbooks.Playbook\"]\n\x15\x43reatePlaybookRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x36\n\x08playbook\x18\x02 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\"\x9f\x01\n\x16\x43reatePlaybookResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12\x36\n\x08playbook\x18\x03 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\"U\n\x17\x43reatePlaybookRequestV2\x12\x0c\n\x04name\x18\x01 \x01(\t\x12,\n\x08playbook\x18\x02 \x01(\x0b\x32\x1a.protos.playbooks.Playbook\"\x97\x01\n\x18\x43reatePlaybookResponseV2\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12,\n\x08playbook\x18\x03 \x01(\x0b\x32\x1a.protos.playbooks.Playbook\"\x95\x01\n\x15UpdatePlaybookRequest\x12\x31\n\x0bplaybook_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12I\n\x13update_playbook_ops\x18\x02 \x03(\x0b\x32,.protos.playbooks.DeprecatedUpdatePlaybookOp\"g\n\x16UpdatePlaybookResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\"\x8d\x01\n\x17UpdatePlaybookRequestV2\x12\x31\n\x0bplaybook_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12?\n\x13update_playbook_ops\x18\x02 \x03(\x0b\x32\".protos.playbooks.UpdatePlaybookOp\"i\n\x18UpdatePlaybookResponseV2\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\"\x9d\x01\n\x16\x45xecutePlaybookRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x31\n\x0bplaybook_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x34\n\x13global_variable_set\x18\x03 \x01(\x0b\x32\x17.google.protobuf.Struct\"\xbb\x01\n\x17\x45xecutePlaybookResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x35\n\x0fplaybook_run_id\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"p\n\x1b\x45xecutionPlaybookGetRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fplaybook_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xd4\x01\n\x1c\x45xecutionPlaybookGetResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12I\n\x12playbook_execution\x18\x04 \x01(\x0b\x32-.protos.playbooks.DeprecatedPlaybookExecution\"r\n\x1d\x45xecutionPlaybookGetRequestV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fplaybook_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xcc\x01\n\x1e\x45xecutionPlaybookGetResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12?\n\x12playbook_execution\x18\x04 \x01(\x0b\x32#.protos.playbooks.PlaybookExecution\"\xd8\x01\n\x1f\x45xecutionPlaybookAPIGetResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12J\n\x13playbook_executions\x18\x04 \x03(\x0b\x32-.protos.playbooks.DeprecatedPlaybookExecution\"\xd0\x01\n!ExecutionPlaybookAPIGetResponseV2\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12@\n\x13playbook_executions\x18\x04 \x03(\x0b\x32#.protos.playbooks.PlaybookExecution\"R\n\x1e\x45xecutionsPlaybooksListRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x14\n\x0cplaybook_ids\x18\x02 \x03(\t\"\xce\x01\n\x1f\x45xecutionsPlaybooksListResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12@\n\x13playbook_executions\x18\x04 \x03(\x0b\x32#.protos.playbooks.PlaybookExecution\"\x94\x01\n\x1cPlaybookTemplatesGetResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12%\n\x04\x64\x61ta\x18\x03 \x03(\x0b\x32\x17.google.protobuf.Struct\"o\n\x1ePlaybookExecutionCreateRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x31\n\x0bplaybook_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\"\x80\x02\n\x1fPlaybookExecutionCreateResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x35\n\x0fplaybook_run_id\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12;\n\x15\x65xecution_session_url\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xa6\x01\n#PlaybookExecutionStepExecuteRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fplaybook_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x04step\x18\x03 \x01(\x0b\x32\x1e.protos.playbooks.PlaybookStep\"\x90\x02\n$PlaybookExecutionStepExecuteResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x35\n\x0fplaybook_run_id\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x46\n\x12step_execution_log\x18\x05 \x01(\x0b\x32*.protos.playbooks.PlaybookStepExecutionLog\"\xb8\x01\n$PlaybookExecutionStatusUpdateRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fplaybook_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12=\n\x06status\x18\x03 \x01(\x0e\x32-.protos.playbooks.PlaybookExecutionStatusType\"\x92\x01\n%PlaybookExecutionStatusUpdateResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\"\x90\x01\n\x1cTestResultTransformerRequest\x12\x46\n\x1btransformer_lambda_function\x18\x01 \x01(\x0b\x32!.protos.playbooks.Lambda.Function\x12(\n\x07payload\x18\x02 \x01(\x0b\x32\x17.google.protobuf.Struct\"\x97\x01\n\x1dTestResultTransformerResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12\'\n\x06output\x18\x03 \x01(\x0b\x32\x17.google.protobuf.Struct\"<\n\x1ePlaybooksBuilderOptionsRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\"\xaf\x03\n\x1fPlaybooksBuilderOptionsResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x62\n\x11interpreter_types\x18\x04 \x03(\x0b\x32G.protos.playbooks.PlaybooksBuilderOptionsResponse.InterpreterTypeOption\x12?\n\x0esource_options\x18\x05 \x03(\x0b\x32\'.protos.playbooks.PlaybookSourceOptions\x1a|\n\x15InterpreterTypeOption\x12/\n\x04type\x18\x01 \x01(\x0e\x32!.protos.playbooks.InterpreterType\x12\x32\n\x0c\x64isplay_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"G\n\x13GetWorkflowsRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x14\n\x0cworkflow_ids\x18\x02 \x03(\x04\"a\n\x14GetWorkflowsResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12-\n\tworkflows\x18\x02 \x03(\x0b\x32\x1a.protos.playbooks.Workflow\"S\n\x15\x43reateWorkflowRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\x12,\n\x08workflow\x18\x02 \x01(\x0b\x32\x1a.protos.playbooks.Workflow\"\x95\x01\n\x16\x43reateWorkflowResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12,\n\x08workflow\x18\x03 \x01(\x0b\x32\x1a.protos.playbooks.Workflow\"\x8b\x01\n\x15UpdateWorkflowRequest\x12\x31\n\x0bworkflow_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12?\n\x13update_workflow_ops\x18\x02 \x03(\x0b\x32\".protos.playbooks.UpdateWorkflowOp\"g\n\x16UpdateWorkflowResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\"\xe5\x01\n\x16\x45xecuteWorkflowRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x31\n\x0bworkflow_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x33\n\rworkflow_name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12G\n\x16workflow_configuration\x18\x04 \x01(\x0b\x32\'.protos.playbooks.WorkflowConfiguration\"\xbb\x01\n\x17\x45xecuteWorkflowResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12\x35\n\x0fworkflow_run_id\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xa9\x01\n!TerminateWorkflowExecutionRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fworkflow_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bworkflow_id\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\x8f\x01\n\"TerminateWorkflowExecutionResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\"v\n\x1b\x45xecutionWorkflowGetRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12;\n\x15workflow_execution_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\"\xca\x01\n\x1c\x45xecutionWorkflowGetResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12?\n\x12workflow_execution\x18\x04 \x01(\x0b\x32#.protos.playbooks.WorkflowExecution\"R\n\x1e\x45xecutionsWorkflowsListRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x14\n\x0cworkflow_ids\x18\x02 \x03(\t\"\xce\x01\n\x1f\x45xecutionsWorkflowsListResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12@\n\x13workflow_executions\x18\x04 \x03(\x0b\x32#.protos.playbooks.WorkflowExecution\"u\n ExecutionsWorkflowsGetAllRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fworkflow_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xd0\x01\n!ExecutionsWorkflowsGetAllResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12@\n\x13workflow_executions\x18\x04 \x03(\x0b\x32#.protos.playbooks.WorkflowExecution\"y\n$ExecutionsWorkflowsGetAllLogsRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12\x35\n\x0fworkflow_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xdb\x01\n%ExecutionsWorkflowsGetAllLogsResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12G\n\x17workflow_execution_logs\x18\x04 \x03(\x0b\x32&.protos.playbooks.WorkflowExecutionLog\"w\n\x12SearchQueryRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12 \n\x07\x63ontext\x18\x02 \x01(\x0e\x32\x0f.protos.Context\x12#\n\x05query\x18\x03 \x01(\x0b\x32\x14.protos.QueryRequest\"F\n\x17SearchPlaybooksResponse\x12+\n\x07results\x18\x01 \x03(\x0b\x32\x1a.protos.playbooks.Playbook\"W\n\x1fSearchPlaybookExecutionResponse\x12\x34\n\x07results\x18\x01 \x03(\x0b\x32#.protos.playbooks.PlaybookExecution\"b\n\x17SearchWorkflowsResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07results\x18\x02 \x03(\x0b\x32\x1a.protos.playbooks.Workflow\"W\n\x1fSearchWorkflowExecutionResponse\x12\x34\n\x07results\x18\x03 \x03(\x0b\x32#.protos.playbooks.WorkflowExecution\"\xd4\x03\n\x13SearchQueryResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12 \n\x07\x63ontext\x18\x04 \x01(\x0e\x32\x0f.protos.Context\x12=\n\x08playbook\x18\x65 \x01(\x0b\x32).protos.playbooks.SearchPlaybooksResponseH\x00\x12O\n\x12playbook_execution\x18\x66 \x01(\x0b\x32\x31.protos.playbooks.SearchPlaybookExecutionResponseH\x00\x12=\n\x08workflow\x18g \x01(\x0b\x32).protos.playbooks.SearchWorkflowsResponseH\x00\x12O\n\x12workflow_execution\x18h \x01(\x0b\x32\x31.protos.playbooks.SearchWorkflowExecutionResponseH\x00\x42\x10\n\x0equery_response\"Y\n\x19SearchQueryOptionsRequest\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12 \n\x07\x63ontext\x18\x02 \x01(\x0e\x32\x0f.protos.Context\"\xd7\x01\n\x1aSearchQueryOptionsResponse\x12\x1a\n\x04meta\x18\x01 \x01(\x0b\x32\x0c.protos.Meta\x12+\n\x07success\x18\x02 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x03 \x01(\x0b\x32\x0f.protos.Message\x12 \n\x07\x63ontext\x18\x04 \x01(\x0e\x32\x0f.protos.Context\x12,\n\x0e\x63olumn_options\x18\x05 \x03(\x0b\x32\x14.protos.ColumnOption\"\x90\x01\n\x1eTestWorkflowTransformerRequest\x12\x46\n\x1btransformer_lambda_function\x18\x01 \x01(\x0b\x32!.protos.playbooks.Lambda.Function\x12&\n\x05\x65vent\x18\x02 \x01(\x0b\x32\x17.google.protobuf.Struct\"\xa0\x01\n\x1fTestWorkflowTransformerResponse\x12+\n\x07success\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\x12.\n\revent_context\x18\x03 \x01(\x0b\x32\x17.google.protobuf.Structb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.playbooks.api_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _RUNPLAYBOOKTASKREQUEST._serialized_start=430
  _RUNPLAYBOOKTASKREQUEST._serialized_end=568
  _RUNPLAYBOOKTASKRESPONSE._serialized_start=571
  _RUNPLAYBOOKTASKRESPONSE._serialized_end=791
  _RUNPLAYBOOKTASKRESPONSEV2._serialized_start=794
  _RUNPLAYBOOKTASKRESPONSEV2._serialized_end=1006
  _RUNPLAYBOOKTASKREQUESTV3._serialized_start=1009
  _RUNPLAYBOOKTASKREQUESTV3._serialized_end=1172
  _RUNPLAYBOOKTASKRESPONSEV3._serialized_start=1175
  _RUNPLAYBOOKTASKRESPONSEV3._serialized_end=1390
  _RUNBULKPLAYBOOKTASKRESPONSE._serialized_start=1393
  _RUNBULKPLAYBOOKTASKRESPONSE._serialized_end=1611
  _RUNPLAYBOOKSTEPREQUEST._serialized_start=1613
  _RUNPLAYBOOKSTEPREQUEST._serialized_end=1740
  _RUNPLAYBOOKSTEPRESPONSE._serialized_start=1743
  _RUNPLAYBOOKSTEPRESPONSE._serialized_end=2059
  _RUNPLAYBOOKSTEPRESPONSEV2._serialized_start=2062
  _RUNPLAYBOOKSTEPRESPONSEV2._serialized_end=2278
  _RUNPLAYBOOKSTEPREQUESTV3._serialized_start=2280
  _RUNPLAYBOOKSTEPREQUESTV3._serialized_end=2389
  _RUNPLAYBOOKSTEPRESPONSEV3._serialized_start=2392
  _RUNPLAYBOOKSTEPRESPONSEV3._serialized_end=2598
  _RUNPLAYBOOKREQUEST._serialized_start=2600
  _RUNPLAYBOOKREQUEST._serialized_end=2704
  _RUNPLAYBOOKRESPONSE._serialized_start=2707
  _RUNPLAYBOOKRESPONSE._serialized_end=2910
  _RUNPLAYBOOKREQUESTV2._serialized_start=2912
  _RUNPLAYBOOKREQUESTV2._serialized_end=3008
  _RUNPLAYBOOKRESPONSEV2._serialized_start=3011
  _RUNPLAYBOOKRESPONSEV2._serialized_end=3206
  _GETPLAYBOOKSREQUEST._serialized_start=3208
  _GETPLAYBOOKSREQUEST._serialized_end=3279
  _GETPLAYBOOKSRESPONSE._serialized_start=3281
  _GETPLAYBOOKSRESPONSE._serialized_end=3388
  _GETPLAYBOOKSREQUESTV2._serialized_start=3390
  _GETPLAYBOOKSREQUESTV2._serialized_end=3463
  _GETPLAYBOOKSRESPONSEV2._serialized_start=3465
  _GETPLAYBOOKSRESPONSEV2._serialized_end=3564
  _CREATEPLAYBOOKREQUEST._serialized_start=3566
  _CREATEPLAYBOOKREQUEST._serialized_end=3659
  _CREATEPLAYBOOKRESPONSE._serialized_start=3662
  _CREATEPLAYBOOKRESPONSE._serialized_end=3821
  _CREATEPLAYBOOKREQUESTV2._serialized_start=3823
  _CREATEPLAYBOOKREQUESTV2._serialized_end=3908
  _CREATEPLAYBOOKRESPONSEV2._serialized_start=3911
  _CREATEPLAYBOOKRESPONSEV2._serialized_end=4062
  _UPDATEPLAYBOOKREQUEST._serialized_start=4065
  _UPDATEPLAYBOOKREQUEST._serialized_end=4214
  _UPDATEPLAYBOOKRESPONSE._serialized_start=4216
  _UPDATEPLAYBOOKRESPONSE._serialized_end=4319
  _UPDATEPLAYBOOKREQUESTV2._serialized_start=4322
  _UPDATEPLAYBOOKREQUESTV2._serialized_end=4463
  _UPDATEPLAYBOOKRESPONSEV2._serialized_start=4465
  _UPDATEPLAYBOOKRESPONSEV2._serialized_end=4570
  _EXECUTEPLAYBOOKREQUEST._serialized_start=4573
  _EXECUTEPLAYBOOKREQUEST._serialized_end=4730
  _EXECUTEPLAYBOOKRESPONSE._serialized_start=4733
  _EXECUTEPLAYBOOKRESPONSE._serialized_end=4920
  _EXECUTIONPLAYBOOKGETREQUEST._serialized_start=4922
  _EXECUTIONPLAYBOOKGETREQUEST._serialized_end=5034
  _EXECUTIONPLAYBOOKGETRESPONSE._serialized_start=5037
  _EXECUTIONPLAYBOOKGETRESPONSE._serialized_end=5249
  _EXECUTIONPLAYBOOKGETREQUESTV2._serialized_start=5251
  _EXECUTIONPLAYBOOKGETREQUESTV2._serialized_end=5365
  _EXECUTIONPLAYBOOKGETRESPONSEV2._serialized_start=5368
  _EXECUTIONPLAYBOOKGETRESPONSEV2._serialized_end=5572
  _EXECUTIONPLAYBOOKAPIGETRESPONSE._serialized_start=5575
  _EXECUTIONPLAYBOOKAPIGETRESPONSE._serialized_end=5791
  _EXECUTIONPLAYBOOKAPIGETRESPONSEV2._serialized_start=5794
  _EXECUTIONPLAYBOOKAPIGETRESPONSEV2._serialized_end=6002
  _EXECUTIONSPLAYBOOKSLISTREQUEST._serialized_start=6004
  _EXECUTIONSPLAYBOOKSLISTREQUEST._serialized_end=6086
  _EXECUTIONSPLAYBOOKSLISTRESPONSE._serialized_start=6089
  _EXECUTIONSPLAYBOOKSLISTRESPONSE._serialized_end=6295
  _PLAYBOOKTEMPLATESGETRESPONSE._serialized_start=6298
  _PLAYBOOKTEMPLATESGETRESPONSE._serialized_end=6446
  _PLAYBOOKEXECUTIONCREATEREQUEST._serialized_start=6448
  _PLAYBOOKEXECUTIONCREATEREQUEST._serialized_end=6559
  _PLAYBOOKEXECUTIONCREATERESPONSE._serialized_start=6562
  _PLAYBOOKEXECUTIONCREATERESPONSE._serialized_end=6818
  _PLAYBOOKEXECUTIONSTEPEXECUTEREQUEST._serialized_start=6821
  _PLAYBOOKEXECUTIONSTEPEXECUTEREQUEST._serialized_end=6987
  _PLAYBOOKEXECUTIONSTEPEXECUTERESPONSE._serialized_start=6990
  _PLAYBOOKEXECUTIONSTEPEXECUTERESPONSE._serialized_end=7262
  _PLAYBOOKEXECUTIONSTATUSUPDATEREQUEST._serialized_start=7265
  _PLAYBOOKEXECUTIONSTATUSUPDATEREQUEST._serialized_end=7449
  _PLAYBOOKEXECUTIONSTATUSUPDATERESPONSE._serialized_start=7452
  _PLAYBOOKEXECUTIONSTATUSUPDATERESPONSE._serialized_end=7598
  _TESTRESULTTRANSFORMERREQUEST._serialized_start=7601
  _TESTRESULTTRANSFORMERREQUEST._serialized_end=7745
  _TESTRESULTTRANSFORMERRESPONSE._serialized_start=7748
  _TESTRESULTTRANSFORMERRESPONSE._serialized_end=7899
  _PLAYBOOKSBUILDEROPTIONSREQUEST._serialized_start=7901
  _PLAYBOOKSBUILDEROPTIONSREQUEST._serialized_end=7961
  _PLAYBOOKSBUILDEROPTIONSRESPONSE._serialized_start=7964
  _PLAYBOOKSBUILDEROPTIONSRESPONSE._serialized_end=8395
  _PLAYBOOKSBUILDEROPTIONSRESPONSE_INTERPRETERTYPEOPTION._serialized_start=8271
  _PLAYBOOKSBUILDEROPTIONSRESPONSE_INTERPRETERTYPEOPTION._serialized_end=8395
  _GETWORKFLOWSREQUEST._serialized_start=8397
  _GETWORKFLOWSREQUEST._serialized_end=8468
  _GETWORKFLOWSRESPONSE._serialized_start=8470
  _GETWORKFLOWSRESPONSE._serialized_end=8567
  _CREATEWORKFLOWREQUEST._serialized_start=8569
  _CREATEWORKFLOWREQUEST._serialized_end=8652
  _CREATEWORKFLOWRESPONSE._serialized_start=8655
  _CREATEWORKFLOWRESPONSE._serialized_end=8804
  _UPDATEWORKFLOWREQUEST._serialized_start=8807
  _UPDATEWORKFLOWREQUEST._serialized_end=8946
  _UPDATEWORKFLOWRESPONSE._serialized_start=8948
  _UPDATEWORKFLOWRESPONSE._serialized_end=9051
  _EXECUTEWORKFLOWREQUEST._serialized_start=9054
  _EXECUTEWORKFLOWREQUEST._serialized_end=9283
  _EXECUTEWORKFLOWRESPONSE._serialized_start=9286
  _EXECUTEWORKFLOWRESPONSE._serialized_end=9473
  _TERMINATEWORKFLOWEXECUTIONREQUEST._serialized_start=9476
  _TERMINATEWORKFLOWEXECUTIONREQUEST._serialized_end=9645
  _TERMINATEWORKFLOWEXECUTIONRESPONSE._serialized_start=9648
  _TERMINATEWORKFLOWEXECUTIONRESPONSE._serialized_end=9791
  _EXECUTIONWORKFLOWGETREQUEST._serialized_start=9793
  _EXECUTIONWORKFLOWGETREQUEST._serialized_end=9911
  _EXECUTIONWORKFLOWGETRESPONSE._serialized_start=9914
  _EXECUTIONWORKFLOWGETRESPONSE._serialized_end=10116
  _EXECUTIONSWORKFLOWSLISTREQUEST._serialized_start=10118
  _EXECUTIONSWORKFLOWSLISTREQUEST._serialized_end=10200
  _EXECUTIONSWORKFLOWSLISTRESPONSE._serialized_start=10203
  _EXECUTIONSWORKFLOWSLISTRESPONSE._serialized_end=10409
  _EXECUTIONSWORKFLOWSGETALLREQUEST._serialized_start=10411
  _EXECUTIONSWORKFLOWSGETALLREQUEST._serialized_end=10528
  _EXECUTIONSWORKFLOWSGETALLRESPONSE._serialized_start=10531
  _EXECUTIONSWORKFLOWSGETALLRESPONSE._serialized_end=10739
  _EXECUTIONSWORKFLOWSGETALLLOGSREQUEST._serialized_start=10741
  _EXECUTIONSWORKFLOWSGETALLLOGSREQUEST._serialized_end=10862
  _EXECUTIONSWORKFLOWSGETALLLOGSRESPONSE._serialized_start=10865
  _EXECUTIONSWORKFLOWSGETALLLOGSRESPONSE._serialized_end=11084
  _SEARCHQUERYREQUEST._serialized_start=11086
  _SEARCHQUERYREQUEST._serialized_end=11205
  _SEARCHPLAYBOOKSRESPONSE._serialized_start=11207
  _SEARCHPLAYBOOKSRESPONSE._serialized_end=11277
  _SEARCHPLAYBOOKEXECUTIONRESPONSE._serialized_start=11279
  _SEARCHPLAYBOOKEXECUTIONRESPONSE._serialized_end=11366
  _SEARCHWORKFLOWSRESPONSE._serialized_start=11368
  _SEARCHWORKFLOWSRESPONSE._serialized_end=11466
  _SEARCHWORKFLOWEXECUTIONRESPONSE._serialized_start=11468
  _SEARCHWORKFLOWEXECUTIONRESPONSE._serialized_end=11555
  _SEARCHQUERYRESPONSE._serialized_start=11558
  _SEARCHQUERYRESPONSE._serialized_end=12026
  _SEARCHQUERYOPTIONSREQUEST._serialized_start=12028
  _SEARCHQUERYOPTIONSREQUEST._serialized_end=12117
  _SEARCHQUERYOPTIONSRESPONSE._serialized_start=12120
  _SEARCHQUERYOPTIONSRESPONSE._serialized_end=12335
  _TESTWORKFLOWTRANSFORMERREQUEST._serialized_start=12338
  _TESTWORKFLOWTRANSFORMERREQUEST._serialized_end=12482
  _TESTWORKFLOWTRANSFORMERRESPONSE._serialized_start=12485
  _TESTWORKFLOWTRANSFORMERRESPONSE._serialized_end=12645
# @@protoc_insertion_point(module_scope)
