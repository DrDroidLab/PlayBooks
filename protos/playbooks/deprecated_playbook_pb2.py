# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/playbooks/deprecated_playbook.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from protos import base_pb2 as protos_dot_base__pb2
from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2
from google.protobuf import struct_pb2 as google_dot_protobuf_dot_struct__pb2
from protos.playbooks import playbook_commons_pb2 as protos_dot_playbooks_dot_playbook__commons__pb2
from protos.playbooks.intelligence_layer import interpreter_pb2 as protos_dot_playbooks_dot_intelligence__layer_dot_interpreter__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n*protos/playbooks/deprecated_playbook.proto\x12\x10protos.playbooks\x1a\x11protos/base.proto\x1a\x1egoogle/protobuf/wrappers.proto\x1a\x1cgoogle/protobuf/struct.proto\x1a\'protos/playbooks/playbook_commons.proto\x1a\x35protos/playbooks/intelligence_layer/interpreter.proto\"\x81\t\n DeprecatedPlaybookCloudwatchTask\x12I\n\x04type\x18\x01 \x01(\x0e\x32;.protos.playbooks.DeprecatedPlaybookCloudwatchTask.TaskType\x12{\n\x15metric_execution_task\x18\x02 \x01(\x0b\x32Z.protos.playbooks.DeprecatedPlaybookCloudwatchTask.DeprecatedCloudwatchMetricExecutionTaskH\x00\x12|\n\x16\x66ilter_log_events_task\x18\x03 \x01(\x0b\x32Z.protos.playbooks.DeprecatedPlaybookCloudwatchTask.DeprecatedCloudwatchFilterLogEventsTaskH\x00\x1a\x84\x04\n\'DeprecatedCloudwatchMetricExecutionTask\x12/\n\tnamespace\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x06region\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bmetric_name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12x\n\ndimensions\x18\x04 \x03(\x0b\x32\x64.protos.playbooks.DeprecatedPlaybookCloudwatchTask.DeprecatedCloudwatchMetricExecutionTask.Dimension\x12/\n\tstatistic\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\x64\n\tDimension\x12*\n\x04name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05value\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\xc1\x01\n\'DeprecatedCloudwatchFilterLogEventsTask\x12,\n\x06region\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x0elog_group_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x32\n\x0c\x66ilter_query\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"D\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x14\n\x10METRIC_EXECUTION\x10\x01\x12\x15\n\x11\x46ILTER_LOG_EVENTS\x10\x02\x42\x06\n\x04task\"\xeb\x07\n\x1d\x44\x65precatedPlaybookGrafanaTask\x12\x46\n\x04type\x18\x01 \x01(\x0e\x32\x38.protos.playbooks.DeprecatedPlaybookGrafanaTask.TaskType\x12\x34\n\x0e\x64\x61tasource_uid\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12{\n\x1cpromql_metric_execution_task\x18\x03 \x01(\x0b\x32S.protos.playbooks.DeprecatedPlaybookGrafanaTask.DeprecatedPromQlMetricExecutionTaskH\x00\x1a\x90\x05\n#DeprecatedPromQlMetricExecutionTask\x12\x37\n\x11promql_expression\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x82\x01\n\x1apromql_label_option_values\x18\x02 \x03(\x0b\x32^.protos.playbooks.DeprecatedPlaybookGrafanaTask.DeprecatedPromQlMetricExecutionTask.LabelValue\x12\x33\n\rdashboard_uid\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0f\x64\x61shboard_title\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12.\n\x08panel_id\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bpanel_title\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x07 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12=\n\x17panel_promql_expression\x18\x08 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\x65\n\nLabelValue\x12*\n\x04name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05value\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"4\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x1b\n\x17PROMQL_METRIC_EXECUTION\x10\x01\x42\x06\n\x04task\"\xad\x0f\n\x1e\x44\x65precatedPlaybookNewRelicTask\x12G\n\x04type\x18\x01 \x01(\x0e\x32\x39.protos.playbooks.DeprecatedPlaybookNewRelicTask.TaskType\x12\xa0\x01\n/entity_application_golden_metric_execution_task\x18\x02 \x01(\x0b\x32\x65.protos.playbooks.DeprecatedPlaybookNewRelicTask.DeprecatedEntityApplicationGoldenMetricExecutionTaskH\x00\x12\xa5\x01\n2entity_dashboard_widget_nrql_metric_execution_task\x18\x03 \x01(\x0b\x32g.protos.playbooks.DeprecatedPlaybookNewRelicTask.DeprecatedEntityDashboardWidgetNRQLMetricExecutionTaskH\x00\x12x\n\x1anrql_metric_execution_task\x18\x04 \x01(\x0b\x32R.protos.playbooks.DeprecatedPlaybookNewRelicTask.DeprecatedNRQLMetricExecutionTaskH\x00\x1a\xa5\x03\n4DeprecatedEntityApplicationGoldenMetricExecutionTask\x12=\n\x17\x61pplication_entity_guid\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12=\n\x17\x61pplication_entity_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x38\n\x12golden_metric_name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x38\n\x12golden_metric_unit\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x43\n\x1dgolden_metric_nrql_expression\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\xc0\x04\n6DeprecatedEntityDashboardWidgetNRQLMetricExecutionTask\x12\x34\n\x0e\x64\x61shboard_guid\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x0e\x64\x61shboard_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12/\n\tpage_guid\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12/\n\tpage_name\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12/\n\twidget_id\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x32\n\x0cwidget_title\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0bwidget_type\x18\x07 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12<\n\x16widget_nrql_expression\x18\x08 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12*\n\x04unit\x18\t \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\n \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\xf1\x01\n!DeprecatedNRQLMetricExecutionTask\x12\x31\n\x0bmetric_name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x35\n\x0fnrql_expression\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12*\n\x04unit\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\x95\x01\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12.\n*ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION\x10\x01\x12\x31\n-ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION\x10\x02\x12\x19\n\x15NRQL_METRIC_EXECUTION\x10\x03\x42\x06\n\x04task\"\x8b\x07\n\x1d\x44\x65precatedPlaybookDatadogTask\x12\x46\n\x04type\x18\x01 \x01(\x0e\x32\x38.protos.playbooks.DeprecatedPlaybookDatadogTask.TaskType\x12}\n\x1dservice_metric_execution_task\x18\x02 \x01(\x0b\x32T.protos.playbooks.DeprecatedPlaybookDatadogTask.DeprecatedServiceMetricExecutionTaskH\x00\x12y\n\x1bquery_metric_execution_task\x18\x03 \x01(\x0b\x32R.protos.playbooks.DeprecatedPlaybookDatadogTask.DeprecatedQueryMetricExecutionTaskH\x00\x1a\xad\x02\n$DeprecatedServiceMetricExecutionTask\x12\x32\n\x0cservice_name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10\x65nvironment_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x33\n\rmetric_family\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x06metric\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\x9c\x01\n\"DeprecatedQueryMetricExecutionTask\x12\x0f\n\x07queries\x18\x01 \x03(\t\x12-\n\x07\x66ormula\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"Q\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x1c\n\x18SERVICE_METRIC_EXECUTION\x10\x01\x12\x1a\n\x16QUERY_METRIC_EXECUTION\x10\x02\x42\x06\n\x04task\"\xb8\x03\n\x1c\x44\x65precatedPlaybookPromQLTask\x12\x45\n\x04type\x18\x01 \x01(\x0e\x32\x37.protos.playbooks.DeprecatedPlaybookPromQLTask.TaskType\x12z\n\x1cpromql_metric_execution_task\x18\x03 \x01(\x0b\x32R.protos.playbooks.DeprecatedPlaybookPromQLTask.DeprecatedPromQlMetricExecutionTaskH\x00\x1a\x96\x01\n#DeprecatedPromQlMetricExecutionTask\x12\x37\n\x11promql_expression\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10process_function\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"4\n\x08TaskType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x1b\n\x17PROMQL_METRIC_EXECUTION\x10\x01\x42\x06\n\x04task\"\xc3\x03\n&DeprecatedPlaybookMetricTaskDefinition\x12\x1e\n\x06source\x18\x01 \x01(\x0e\x32\x0e.protos.Source\x12M\n\x0f\x63loudwatch_task\x18\x06 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookCloudwatchTaskH\x00\x12G\n\x0cgrafana_task\x18\x07 \x01(\x0b\x32/.protos.playbooks.DeprecatedPlaybookGrafanaTaskH\x00\x12J\n\x0enew_relic_task\x18\x08 \x01(\x0b\x32\x30.protos.playbooks.DeprecatedPlaybookNewRelicTaskH\x00\x12G\n\x0c\x64\x61tadog_task\x18\t \x01(\x0b\x32/.protos.playbooks.DeprecatedPlaybookDatadogTaskH\x00\x12\x44\n\nmimir_task\x18\n \x01(\x0b\x32..protos.playbooks.DeprecatedPlaybookPromQLTaskH\x00\x42\x06\n\x04task\"\xac\x04\n+DeprecatedPlaybookMetricTaskExecutionResult\x12%\n\rmetric_source\x18\x01 \x01(\x0e\x32\x0e.protos.Source\x12\x31\n\x0bmetric_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x37\n\x11metric_expression\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12T\n\x06result\x18\x05 \x01(\x0b\x32\x44.protos.playbooks.DeprecatedPlaybookMetricTaskExecutionResult.Result\x1a\x93\x02\n\x06Result\x12W\n\x04type\x18\x01 \x01(\x0e\x32I.protos.playbooks.DeprecatedPlaybookMetricTaskExecutionResult.Result.Type\x12\x38\n\ntimeseries\x18\x02 \x01(\x0b\x32\".protos.playbooks.TimeseriesResultH\x00\x12\x35\n\x0ctable_result\x18\x03 \x01(\x0b\x32\x1d.protos.playbooks.TableResultH\x00\"5\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x0e\n\nTIMESERIES\x10\x01\x12\x10\n\x0cTABLE_RESULT\x10\x02\x42\x08\n\x06result\"\xdb\x01\n-DeprecatedPlaybookDocumentationTaskDefinition\x12R\n\x04type\x18\x01 \x01(\x0e\x32\x44.protos.playbooks.DeprecatedPlaybookDocumentationTaskDefinition.Type\x12\x33\n\rdocumentation\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"!\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x0c\n\x08MARKDOWN\x10\x01\"\xd5\x04\n2DeprecatedPlaybookDocumentationTaskExecutionResult\x12;\n\x15\x64ocumentation_task_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12=\n\x17\x64ocumentation_task_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12[\n\x06result\x18\x03 \x01(\x0b\x32K.protos.playbooks.DeprecatedPlaybookDocumentationTaskExecutionResult.Result\x1a\xc5\x02\n\x06Result\x12^\n\x04type\x18\x01 \x01(\x0e\x32P.protos.playbooks.DeprecatedPlaybookDocumentationTaskExecutionResult.Result.Type\x12u\n\x0fmarkdown_result\x18\x02 \x01(\x0b\x32Z.protos.playbooks.DeprecatedPlaybookDocumentationTaskExecutionResult.Result.MarkdownResultH\x00\x1a\x37\n\x0eMarkdownResult\x12%\n\x04text\x18\x01 \x01(\x0b\x32\x17.google.protobuf.Struct\"!\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x0c\n\x08MARKDOWN\x10\x01\x42\x08\n\x06result\"\x88\x01\n)DeprecatedPlaybookClickhouseDataFetchTask\x12.\n\x08\x64\x61tabase\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05query\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\x86\x01\n\'DeprecatedPlaybookPostgresDataFetchTask\x12.\n\x08\x64\x61tabase\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05query\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\x9e\x03\n\"DeprecatedPlaybookEksDataFetchTask\x12V\n\x0c\x63ommand_type\x18\x01 \x01(\x0e\x32@.protos.playbooks.DeprecatedPlaybookEksDataFetchTask.CommandType\x12\x31\n\x0b\x64\x65scription\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12,\n\x06region\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07\x63luster\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12/\n\tnamespace\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"_\n\x0b\x43ommandType\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x0c\n\x08GET_PODS\x10\x01\x12\x13\n\x0fGET_DEPLOYMENTS\x10\x02\x12\x0e\n\nGET_EVENTS\x10\x03\x12\x10\n\x0cGET_SERVICES\x10\x04\"c\n4DeprecatedPlaybookSqlDatabaseConnectionDataFetchTask\x12+\n\x05query\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xf7\x04\n)DeprecatedPlaybookDataFetchTaskDefinition\x12\x1e\n\x06source\x18\x01 \x01(\x0e\x32\x0e.protos.Source\x12\x35\n\x0forder_by_column\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05limit\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12,\n\x06offset\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x61\n\x1a\x63lickhouse_data_fetch_task\x18\x05 \x01(\x0b\x32;.protos.playbooks.DeprecatedPlaybookClickhouseDataFetchTaskH\x00\x12]\n\x18postgres_data_fetch_task\x18\x06 \x01(\x0b\x32\x39.protos.playbooks.DeprecatedPlaybookPostgresDataFetchTaskH\x00\x12S\n\x13\x65ks_data_fetch_task\x18\x07 \x01(\x0b\x32\x34.protos.playbooks.DeprecatedPlaybookEksDataFetchTaskH\x00\x12y\n\'sql_database_connection_data_fetch_task\x18\x08 \x01(\x0b\x32\x46.protos.playbooks.DeprecatedPlaybookSqlDatabaseConnectionDataFetchTaskH\x00\x42\x06\n\x04task\"\xf3\x03\n.DeprecatedPlaybookDataFetchTaskExecutionResult\x12\x38\n\x12\x64\x61ta_fetch_task_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12:\n\x14\x64\x61ta_fetch_task_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12#\n\x0b\x64\x61ta_source\x18\x03 \x01(\x0e\x32\x0e.protos.Source\x12W\n\x06result\x18\x04 \x01(\x0b\x32G.protos.playbooks.DeprecatedPlaybookDataFetchTaskExecutionResult.Result\x1a\xcc\x01\n\x06Result\x12Z\n\x04type\x18\x01 \x01(\x0e\x32L.protos.playbooks.DeprecatedPlaybookDataFetchTaskExecutionResult.Result.Type\x12\x35\n\x0ctable_result\x18\x02 \x01(\x0b\x32\x1d.protos.playbooks.TableResultH\x00\"%\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x10\n\x0cTABLE_RESULT\x10\x01\x42\x08\n\x06result\"\x98\x03\n\x1d\x44\x65precatedPlaybookApiCallTask\x12\x46\n\x06method\x18\x01 \x01(\x0e\x32\x36.protos.playbooks.DeprecatedPlaybookApiCallTask.Method\x12)\n\x03url\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07headers\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07payload\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07timeout\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12-\n\x07\x63ookies\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"H\n\x06Method\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x07\n\x03GET\x10\x01\x12\x08\n\x04POST\x10\x02\x12\x07\n\x03PUT\x10\x03\x12\t\n\x05PATCH\x10\x04\x12\n\n\x06\x44\x45LETE\x10\x05\"\x87\x01\n!DeprecatedPlaybookBashCommandTask\x12-\n\x07\x63ommand\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x33\n\rremote_server\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"\xed\x02\n&DeprecatedPlaybookActionTaskDefinition\x12\x1e\n\x06source\x18\x01 \x01(\x0e\x32\x0e.protos.Source\x12(\n\x02id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12*\n\x04name\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12)\n\x08metadata\x18\x04 \x01(\x0b\x32\x17.google.protobuf.Struct\x12H\n\rapi_call_task\x18\x05 \x01(\x0b\x32/.protos.playbooks.DeprecatedPlaybookApiCallTaskH\x00\x12P\n\x11\x62\x61sh_command_task\x18\x06 \x01(\x0b\x32\x33.protos.playbooks.DeprecatedPlaybookBashCommandTaskH\x00\x42\x06\n\x04task\"\xa6\x04\n+DeprecatedPlaybookActionTaskExecutionResult\x12\x34\n\x0e\x61\x63tion_task_id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x36\n\x10\x61\x63tion_task_name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12T\n\x06result\x18\x03 \x01(\x0b\x32\x44.protos.playbooks.DeprecatedPlaybookActionTaskExecutionResult.Result\x1a\xb2\x02\n\x06Result\x12W\n\x04type\x18\x01 \x01(\x0e\x32I.protos.playbooks.DeprecatedPlaybookActionTaskExecutionResult.Result.Type\x12;\n\x0c\x61pi_response\x18\x02 \x01(\x0b\x32#.protos.playbooks.ApiResponseResultH\x00\x12H\n\x13\x62\x61sh_command_output\x18\x03 \x01(\x0b\x32).protos.playbooks.BashCommandOutputResultH\x00\">\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x10\n\x0c\x41PI_RESPONSE\x10\x01\x12\x17\n\x13\x42\x41SH_COMMAND_OUTPUT\x10\x02\x42\x08\n\x06result\"\xd1\x06\n DeprecatedPlaybookTaskDefinition\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12*\n\x04name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0b\x64\x65scription\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05notes\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x34\n\x13global_variable_set\x18\x05 \x01(\x0b\x32\x17.google.protobuf.Struct\x12\x45\n\x04type\x18\x06 \x01(\x0e\x32\x37.protos.playbooks.DeprecatedPlaybookTaskDefinition.Type\x12;\n\x10interpreter_type\x18\x07 \x01(\x0e\x32!.protos.playbooks.InterpreterType\x12O\n\x0bmetric_task\x18\x08 \x01(\x0b\x32\x38.protos.playbooks.DeprecatedPlaybookMetricTaskDefinitionH\x00\x12V\n\x0f\x64\x61ta_fetch_task\x18\n \x01(\x0b\x32;.protos.playbooks.DeprecatedPlaybookDataFetchTaskDefinitionH\x00\x12]\n\x12\x64ocumentation_task\x18\x0b \x01(\x0b\x32?.protos.playbooks.DeprecatedPlaybookDocumentationTaskDefinitionH\x00\x12O\n\x0b\x61\x63tion_task\x18\x0c \x01(\x0b\x32\x38.protos.playbooks.DeprecatedPlaybookActionTaskDefinitionH\x00\"\\\n\x04Type\x12\x0b\n\x07UNKNOWN\x10\x00\x12\n\n\x06METRIC\x10\x01\x12\x0c\n\x08\x44\x45\x43ISION\x10\x02\x12\x0e\n\nDATA_FETCH\x10\x03\x12\x11\n\rDOCUMENTATION\x10\x04\x12\n\n\x06\x41\x43TION\x10\x05\x42\x06\n\x04task\"\xbe\x04\n%DeprecatedPlaybookTaskExecutionResult\x12+\n\x05\x65rror\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\x07message\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x65\n\x1cmetric_task_execution_result\x18\x03 \x01(\x0b\x32=.protos.playbooks.DeprecatedPlaybookMetricTaskExecutionResultH\x00\x12l\n data_fetch_task_execution_result\x18\x04 \x01(\x0b\x32@.protos.playbooks.DeprecatedPlaybookDataFetchTaskExecutionResultH\x00\x12s\n#documentation_task_execution_result\x18\x05 \x01(\x0b\x32\x44.protos.playbooks.DeprecatedPlaybookDocumentationTaskExecutionResultH\x00\x12\x65\n\x1c\x61\x63tion_task_execution_result\x18\x06 \x01(\x0b\x32=.protos.playbooks.DeprecatedPlaybookActionTaskExecutionResultH\x00\x42\x08\n\x06result\"\x90\x03\n DeprecatedPlaybookStepDefinition\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12*\n\x04name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0b\x64\x65scription\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05notes\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x0e\x65xternal_links\x18\x05 \x03(\x0b\x32\x1e.protos.playbooks.ExternalLink\x12;\n\x10interpreter_type\x18\x06 \x01(\x0e\x32!.protos.playbooks.InterpreterType\x12\x41\n\x05tasks\x18\x07 \x03(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookTaskDefinition\"\xdf\x03\n\x12\x44\x65precatedPlaybook\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12*\n\x04name\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x31\n\x0b\x64\x65scription\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12-\n\tis_active\x18\x04 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12\x30\n\ncreated_by\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x12\n\ncreated_at\x18\x06 \x01(\x10\x12\x13\n\x0blast_run_at\x18\x07 \x01(\x10\x12=\n\x06status\x18\x08 \x01(\x0e\x32-.protos.playbooks.PlaybookExecutionStatusType\x12\x41\n\x05steps\x18\t \x03(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookStepDefinition\x12\x34\n\x13global_variable_set\x18\n \x01(\x0b\x32\x17.google.protobuf.Struct\"\xe7\x03\n\x1e\x44\x65precatedPlaybookExecutionLog\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x11\n\ttimestamp\x18\x02 \x01(\x10\x12\x35\n\x0fplaybook_run_id\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x08playbook\x18\x04 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\x12@\n\x04step\x18\x05 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookStepDefinition\x12@\n\x04task\x18\x06 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookTaskDefinition\x12V\n\x15task_execution_result\x18\x07 \x01(\x0b\x32\x37.protos.playbooks.DeprecatedPlaybookTaskExecutionResult\x12=\n\x13task_interpretation\x18\x08 \x01(\x0b\x32 .protos.playbooks.Interpretation\"\xa2\x02\n\"DeprecatedPlaybookStepExecutionLog\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x11\n\ttimestamp\x18\x02 \x01(\x10\x12@\n\x04step\x18\x03 \x01(\x0b\x32\x32.protos.playbooks.DeprecatedPlaybookStepDefinition\x12>\n\x04logs\x18\x04 \x03(\x0b\x32\x30.protos.playbooks.DeprecatedPlaybookExecutionLog\x12=\n\x13step_interpretation\x18\x05 \x01(\x0b\x32 .protos.playbooks.Interpretation\"\x9e\x04\n\x1b\x44\x65precatedPlaybookExecution\x12(\n\x02id\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\x12\x35\n\x0fplaybook_run_id\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x08playbook\x18\x03 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\x12=\n\x06status\x18\x04 \x01(\x0e\x32-.protos.playbooks.PlaybookExecutionStatusType\x12\x12\n\ncreated_at\x18\x05 \x01(\x10\x12\x12\n\nstarted_at\x18\x06 \x01(\x10\x12\x13\n\x0b\x66inished_at\x18\x07 \x01(\x10\x12%\n\ntime_range\x18\x08 \x01(\x0b\x32\x11.protos.TimeRange\x12\x30\n\ncreated_by\x18\t \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12>\n\x04logs\x18\n \x03(\x0b\x32\x30.protos.playbooks.DeprecatedPlaybookExecutionLog\x12Q\n\x13step_execution_logs\x18\x0b \x03(\x0b\x32\x34.protos.playbooks.DeprecatedPlaybookStepExecutionLog\"\xb2\x05\n\x1a\x44\x65precatedUpdatePlaybookOp\x12;\n\x02op\x18\x01 \x01(\x0e\x32/.protos.playbooks.DeprecatedUpdatePlaybookOp.Op\x12_\n\x14update_playbook_name\x18\x02 \x01(\x0b\x32?.protos.playbooks.DeprecatedUpdatePlaybookOp.UpdatePlaybookNameH\x00\x12\x63\n\x16update_playbook_status\x18\x03 \x01(\x0b\x32\x41.protos.playbooks.DeprecatedUpdatePlaybookOp.UpdatePlaybookStatusH\x00\x12V\n\x0fupdate_playbook\x18\x04 \x01(\x0b\x32;.protos.playbooks.DeprecatedUpdatePlaybookOp.UpdatePlaybookH\x00\x1a@\n\x12UpdatePlaybookName\x12*\n\x04name\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x1a\x45\n\x14UpdatePlaybookStatus\x12-\n\tis_active\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x1aH\n\x0eUpdatePlaybook\x12\x36\n\x08playbook\x18\x01 \x01(\x0b\x32$.protos.playbooks.DeprecatedPlaybook\"\\\n\x02Op\x12\x0b\n\x07UNKNOWN\x10\x00\x12\x18\n\x14UPDATE_PLAYBOOK_NAME\x10\x01\x12\x1a\n\x16UPDATE_PLAYBOOK_STATUS\x10\x02\x12\x13\n\x0fUPDATE_PLAYBOOK\x10\x03\x42\x08\n\x06updateb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.playbooks.deprecated_playbook_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK._serialized_start=242
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK._serialized_end=1395
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHMETRICEXECUTIONTASK._serialized_start=605
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHMETRICEXECUTIONTASK._serialized_end=1121
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHMETRICEXECUTIONTASK_DIMENSION._serialized_start=1021
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHMETRICEXECUTIONTASK_DIMENSION._serialized_end=1121
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHFILTERLOGEVENTSTASK._serialized_start=1124
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_DEPRECATEDCLOUDWATCHFILTERLOGEVENTSTASK._serialized_end=1317
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_TASKTYPE._serialized_start=1319
  _DEPRECATEDPLAYBOOKCLOUDWATCHTASK_TASKTYPE._serialized_end=1387
  _DEPRECATEDPLAYBOOKGRAFANATASK._serialized_start=1398
  _DEPRECATEDPLAYBOOKGRAFANATASK._serialized_end=2401
  _DEPRECATEDPLAYBOOKGRAFANATASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK._serialized_start=1683
  _DEPRECATEDPLAYBOOKGRAFANATASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK._serialized_end=2339
  _DEPRECATEDPLAYBOOKGRAFANATASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK_LABELVALUE._serialized_start=2238
  _DEPRECATEDPLAYBOOKGRAFANATASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK_LABELVALUE._serialized_end=2339
  _DEPRECATEDPLAYBOOKGRAFANATASK_TASKTYPE._serialized_start=2341
  _DEPRECATEDPLAYBOOKGRAFANATASK_TASKTYPE._serialized_end=2393
  _DEPRECATEDPLAYBOOKNEWRELICTASK._serialized_start=2404
  _DEPRECATEDPLAYBOOKNEWRELICTASK._serialized_end=4369
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDENTITYAPPLICATIONGOLDENMETRICEXECUTIONTASK._serialized_start=2965
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDENTITYAPPLICATIONGOLDENMETRICEXECUTIONTASK._serialized_end=3386
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDENTITYDASHBOARDWIDGETNRQLMETRICEXECUTIONTASK._serialized_start=3389
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDENTITYDASHBOARDWIDGETNRQLMETRICEXECUTIONTASK._serialized_end=3965
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDNRQLMETRICEXECUTIONTASK._serialized_start=3968
  _DEPRECATEDPLAYBOOKNEWRELICTASK_DEPRECATEDNRQLMETRICEXECUTIONTASK._serialized_end=4209
  _DEPRECATEDPLAYBOOKNEWRELICTASK_TASKTYPE._serialized_start=4212
  _DEPRECATEDPLAYBOOKNEWRELICTASK_TASKTYPE._serialized_end=4361
  _DEPRECATEDPLAYBOOKDATADOGTASK._serialized_start=4372
  _DEPRECATEDPLAYBOOKDATADOGTASK._serialized_end=5279
  _DEPRECATEDPLAYBOOKDATADOGTASK_DEPRECATEDSERVICEMETRICEXECUTIONTASK._serialized_start=4728
  _DEPRECATEDPLAYBOOKDATADOGTASK_DEPRECATEDSERVICEMETRICEXECUTIONTASK._serialized_end=5029
  _DEPRECATEDPLAYBOOKDATADOGTASK_DEPRECATEDQUERYMETRICEXECUTIONTASK._serialized_start=5032
  _DEPRECATEDPLAYBOOKDATADOGTASK_DEPRECATEDQUERYMETRICEXECUTIONTASK._serialized_end=5188
  _DEPRECATEDPLAYBOOKDATADOGTASK_TASKTYPE._serialized_start=5190
  _DEPRECATEDPLAYBOOKDATADOGTASK_TASKTYPE._serialized_end=5271
  _DEPRECATEDPLAYBOOKPROMQLTASK._serialized_start=5282
  _DEPRECATEDPLAYBOOKPROMQLTASK._serialized_end=5722
  _DEPRECATEDPLAYBOOKPROMQLTASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK._serialized_start=5510
  _DEPRECATEDPLAYBOOKPROMQLTASK_DEPRECATEDPROMQLMETRICEXECUTIONTASK._serialized_end=5660
  _DEPRECATEDPLAYBOOKPROMQLTASK_TASKTYPE._serialized_start=2341
  _DEPRECATEDPLAYBOOKPROMQLTASK_TASKTYPE._serialized_end=2393
  _DEPRECATEDPLAYBOOKMETRICTASKDEFINITION._serialized_start=5725
  _DEPRECATEDPLAYBOOKMETRICTASKDEFINITION._serialized_end=6176
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT._serialized_start=6179
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT._serialized_end=6735
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT_RESULT._serialized_start=6460
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT_RESULT._serialized_end=6735
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT_RESULT_TYPE._serialized_start=6672
  _DEPRECATEDPLAYBOOKMETRICTASKEXECUTIONRESULT_RESULT_TYPE._serialized_end=6725
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKDEFINITION._serialized_start=6738
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKDEFINITION._serialized_end=6957
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKDEFINITION_TYPE._serialized_start=6924
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKDEFINITION_TYPE._serialized_end=6957
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT._serialized_start=6960
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT._serialized_end=7557
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT._serialized_start=7232
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT._serialized_end=7557
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT_MARKDOWNRESULT._serialized_start=7457
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT_MARKDOWNRESULT._serialized_end=7512
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT_TYPE._serialized_start=6924
  _DEPRECATEDPLAYBOOKDOCUMENTATIONTASKEXECUTIONRESULT_RESULT_TYPE._serialized_end=6957
  _DEPRECATEDPLAYBOOKCLICKHOUSEDATAFETCHTASK._serialized_start=7560
  _DEPRECATEDPLAYBOOKCLICKHOUSEDATAFETCHTASK._serialized_end=7696
  _DEPRECATEDPLAYBOOKPOSTGRESDATAFETCHTASK._serialized_start=7699
  _DEPRECATEDPLAYBOOKPOSTGRESDATAFETCHTASK._serialized_end=7833
  _DEPRECATEDPLAYBOOKEKSDATAFETCHTASK._serialized_start=7836
  _DEPRECATEDPLAYBOOKEKSDATAFETCHTASK._serialized_end=8250
  _DEPRECATEDPLAYBOOKEKSDATAFETCHTASK_COMMANDTYPE._serialized_start=8155
  _DEPRECATEDPLAYBOOKEKSDATAFETCHTASK_COMMANDTYPE._serialized_end=8250
  _DEPRECATEDPLAYBOOKSQLDATABASECONNECTIONDATAFETCHTASK._serialized_start=8252
  _DEPRECATEDPLAYBOOKSQLDATABASECONNECTIONDATAFETCHTASK._serialized_end=8351
  _DEPRECATEDPLAYBOOKDATAFETCHTASKDEFINITION._serialized_start=8354
  _DEPRECATEDPLAYBOOKDATAFETCHTASKDEFINITION._serialized_end=8985
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT._serialized_start=8988
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT._serialized_end=9487
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT_RESULT._serialized_start=9283
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT_RESULT._serialized_end=9487
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT_RESULT_TYPE._serialized_start=9440
  _DEPRECATEDPLAYBOOKDATAFETCHTASKEXECUTIONRESULT_RESULT_TYPE._serialized_end=9477
  _DEPRECATEDPLAYBOOKAPICALLTASK._serialized_start=9490
  _DEPRECATEDPLAYBOOKAPICALLTASK._serialized_end=9898
  _DEPRECATEDPLAYBOOKAPICALLTASK_METHOD._serialized_start=9826
  _DEPRECATEDPLAYBOOKAPICALLTASK_METHOD._serialized_end=9898
  _DEPRECATEDPLAYBOOKBASHCOMMANDTASK._serialized_start=9901
  _DEPRECATEDPLAYBOOKBASHCOMMANDTASK._serialized_end=10036
  _DEPRECATEDPLAYBOOKACTIONTASKDEFINITION._serialized_start=10039
  _DEPRECATEDPLAYBOOKACTIONTASKDEFINITION._serialized_end=10404
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT._serialized_start=10407
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT._serialized_end=10957
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT_RESULT._serialized_start=10651
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT_RESULT._serialized_end=10957
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT_RESULT_TYPE._serialized_start=10885
  _DEPRECATEDPLAYBOOKACTIONTASKEXECUTIONRESULT_RESULT_TYPE._serialized_end=10947
  _DEPRECATEDPLAYBOOKTASKDEFINITION._serialized_start=10960
  _DEPRECATEDPLAYBOOKTASKDEFINITION._serialized_end=11809
  _DEPRECATEDPLAYBOOKTASKDEFINITION_TYPE._serialized_start=11709
  _DEPRECATEDPLAYBOOKTASKDEFINITION_TYPE._serialized_end=11801
  _DEPRECATEDPLAYBOOKTASKEXECUTIONRESULT._serialized_start=11812
  _DEPRECATEDPLAYBOOKTASKEXECUTIONRESULT._serialized_end=12386
  _DEPRECATEDPLAYBOOKSTEPDEFINITION._serialized_start=12389
  _DEPRECATEDPLAYBOOKSTEPDEFINITION._serialized_end=12789
  _DEPRECATEDPLAYBOOK._serialized_start=12792
  _DEPRECATEDPLAYBOOK._serialized_end=13271
  _DEPRECATEDPLAYBOOKEXECUTIONLOG._serialized_start=13274
  _DEPRECATEDPLAYBOOKEXECUTIONLOG._serialized_end=13761
  _DEPRECATEDPLAYBOOKSTEPEXECUTIONLOG._serialized_start=13764
  _DEPRECATEDPLAYBOOKSTEPEXECUTIONLOG._serialized_end=14054
  _DEPRECATEDPLAYBOOKEXECUTION._serialized_start=14057
  _DEPRECATEDPLAYBOOKEXECUTION._serialized_end=14599
  _DEPRECATEDUPDATEPLAYBOOKOP._serialized_start=14602
  _DEPRECATEDUPDATEPLAYBOOKOP._serialized_end=15292
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOKNAME._serialized_start=14979
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOKNAME._serialized_end=15043
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOKSTATUS._serialized_start=15045
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOKSTATUS._serialized_end=15114
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOK._serialized_start=15116
  _DEPRECATEDUPDATEPLAYBOOKOP_UPDATEPLAYBOOK._serialized_end=15188
  _DEPRECATEDUPDATEPLAYBOOKOP_OP._serialized_start=15190
  _DEPRECATEDUPDATEPLAYBOOKOP_OP._serialized_end=15282
# @@protoc_insertion_point(module_scope)
