# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/base.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import wrappers_pb2 as google_dot_protobuf_dot_wrappers__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x11protos/base.proto\x12\x06protos\x1a\x1egoogle/protobuf/wrappers.proto\".\n\tTimeRange\x12\x10\n\x08time_geq\x18\x01 \x01(\x04\x12\x0f\n\x07time_lt\x18\x02 \x01(\x04\"a\n\x04Page\x12+\n\x05limit\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt32Value\x12,\n\x06offset\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.UInt32Value\"\xaf\x01\n\x04Meta\x12%\n\ntime_range\x18\x01 \x01(\x0b\x32\x11.protos.TimeRange\x12\x1a\n\x04page\x18\x02 \x01(\x0b\x32\x0c.protos.Page\x12\x31\n\x0btotal_count\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.UInt32Value\x12\x31\n\rshow_inactive\x18\x04 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\"@\n\x07Message\x12\r\n\x05title\x18\x01 \x01(\t\x12\x13\n\x0b\x64\x65scription\x18\x02 \x01(\t\x12\x11\n\ttraceback\x18\x03 \x01(\t\"[\n\x0c\x45rrorMessage\x12)\n\x05\x65rror\x18\x01 \x01(\x0b\x32\x1a.google.protobuf.BoolValue\x12 \n\x07message\x18\x02 \x01(\x0b\x32\x0f.protos.Message\"\\\n\rOpDescription\x12\x16\n\x02op\x18\x01 \x01(\x0e\x32\n.protos.Op\x12\r\n\x05label\x18\x02 \x01(\t\x12\x10\n\x08is_unary\x18\x03 \x01(\x08\x12\x12\n\nis_logical\x18\x04 \x01(\x08\"\xc7\x02\n\x10TaskCronSchedule\x12-\n\x07minutes\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12+\n\x05hours\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10\x64\x61ys_of_the_week\x18\x03 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x37\n\x11\x64\x61ys_of_the_month\x18\x04 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12\x36\n\x10\x64\x61ys_of_the_year\x18\x05 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12.\n\x08timezone\x18\x06 \x01(\x0b\x32\x1c.google.protobuf.StringValue\"I\n\x0cTaskInterval\x12\x39\n\x13interval_in_seconds\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.UInt64Value\"j\n\x0cTaskCronRule\x12*\n\x04rule\x18\x01 \x01(\x0b\x32\x1c.google.protobuf.StringValue\x12.\n\x08timezone\x18\x02 \x01(\x0b\x32\x1c.google.protobuf.StringValue*Q\n\x08\x46unction\x12\r\n\tUNKNOWN_F\x10\x00\x12\t\n\x05\x41VG_F\x10\x01\x12\t\n\x05SUM_F\x10\x02\x12\t\n\x05MIN_F\x10\x03\x12\t\n\x05MAX_F\x10\x04\x12\n\n\x06LAST_F\x10\x05*\xb7\x01\n\x08Operator\x12\r\n\tUNKNOWN_O\x10\x00\x12\x12\n\x0eGREATER_THAN_O\x10\x01\x12\x18\n\x14GREATER_THAN_EQUAL_O\x10\x02\x12\x0f\n\x0bLESS_THAN_O\x10\x03\x12\x15\n\x11LESS_THAN_EQUAL_O\x10\x04\x12\x0b\n\x07\x45QUAL_O\x10\x05\x12\x0f\n\x0bNOT_EQUAL_O\x10\x06\x12\n\n\x06LIKE_O\x10\x07\x12\x0c\n\x08\x45XISTS_O\x10\x08\x12\x0e\n\nCONTAINS_O\x10\t*D\n\x0fLogicalOperator\x12\x0e\n\nUNKNOWN_LO\x10\x00\x12\n\n\x06\x41ND_LO\x10\x01\x12\t\n\x05OR_LO\x10\x02\x12\n\n\x06NOT_LO\x10\x03*\x8e\x01\n\x02Op\x12\x0e\n\nUNKNOWN_OP\x10\x00\x12\x06\n\x02\x45Q\x10\x01\x12\x07\n\x03NEQ\x10\x02\x12\x06\n\x02GT\x10\x03\x12\x06\n\x02LT\x10\x04\x12\x07\n\x03GTE\x10\x05\x12\x07\n\x03LTE\x10\x06\x12\x06\n\x02IN\x10\x07\x12\n\n\x06NOT_IN\x10\x08\x12\x0b\n\x07IS_NULL\x10\t\x12\n\n\x06\x45XISTS\x10\n\x12\x07\n\x03\x41ND\x10\x14\x12\x06\n\x02OR\x10\x15\x12\x07\n\x03NOT\x10\x16*d\n\x07\x43ontext\x12\r\n\tUNKNOWN_C\x10\x00\x12\x0c\n\x08PLAYBOOK\x10\x01\x12\x16\n\x12PLAYBOOK_EXECUTION\x10\x02\x12\x0c\n\x08WORKFLOW\x10\x03\x12\x16\n\x12WORKFLOW_EXECUTION\x10\x04*\xf9\x05\n\x06Source\x12\x0b\n\x07UNKNOWN\x10\x00\x12\n\n\x06SENTRY\x10\x01\x12\x0b\n\x07SEGMENT\x10\x02\x12\x12\n\x0e\x45LASTIC_SEARCH\x10\x03\x12\r\n\tAMPLITUDE\x10\x04\x12\x0f\n\x0b\x41WS_KINESIS\x10\x05\x12\x0e\n\nCLOUDWATCH\x10\x06\x12\r\n\tCLEVERTAP\x10\x07\x12\x0f\n\x0bRUDDERSTACK\x10\x08\x12\x0c\n\x08MOENGAGE\x10\t\x12\t\n\x05\x43RIBL\x10\n\x12\t\n\x05KAFKA\x10\x0b\x12\x0b\n\x07\x44\x41TADOG\x10\x0c\x12\x0c\n\x08\x46ILEBEAT\x10\r\x12\x0c\n\x08LOGSTASH\x10\x0e\x12\x0b\n\x07\x46LUENTD\x10\x0f\x12\r\n\tFLUENTBIT\x10\x10\x12\x0e\n\nPAGER_DUTY\x10\x11\x12\r\n\tNEW_RELIC\x10\x12\x12\t\n\x05SLACK\x10\x13\x12\x0f\n\x0bHONEYBADGER\x10\x14\x12\x0f\n\x0bGOOGLE_CHAT\x10\x15\x12\x11\n\rDATADOG_OAUTH\x10\x16\x12\x07\n\x03GCM\x10\x17\x12\x0e\n\nPROMETHEUS\x10\x18\x12\x0f\n\x0b\x45LASTIC_APM\x10\x19\x12\x14\n\x10VICTORIA_METRICS\x10\x1a\x12\x11\n\rSLACK_CONNECT\x10\x1b\x12\x0b\n\x07GRAFANA\x10\x1c\x12\x0e\n\nCLICKHOUSE\x10\x1d\x12\x11\n\rDOCUMENTATION\x10\x1e\x12\x0c\n\x08POSTGRES\x10\x1f\x12\r\n\tOPS_GENIE\x10 \x12\x07\n\x03\x45KS\x10!\x12\x0f\n\x0b\x41GENT_PROXY\x10\"\x12\x0f\n\x0bGRAFANA_VPC\x10#\x12\x12\n\x0eGITHUB_ACTIONS\x10$\x12\x1b\n\x17SQL_DATABASE_CONNECTION\x10%\x12\x0b\n\x07OPEN_AI\x10&\x12\x11\n\rREMOTE_SERVER\x10\'\x12\x07\n\x03\x41PI\x10(\x12\x08\n\x04\x42\x41SH\x10)\x12\t\n\x05\x41ZURE\x10*\x12\x11\n\rGRAFANA_MIMIR\x10+\x12\x07\n\x03GKE\x10,\x12\x0c\n\x08MS_TEAMS\x10-\x12\x10\n\x0cGRAFANA_LOKI\x10.\x12\x0e\n\nKUBERNETES\x10/\x12\x08\n\x04SMTP\x10\x30\x12\r\n\tBIG_QUERY\x10\x31*\xd9\x0f\n\rSourceKeyType\x12\x0f\n\x0bUNKNOWN_SKT\x10\x00\x12\x12\n\x0eSENTRY_API_KEY\x10\x01\x12\x13\n\x0fSENTRY_ORG_SLUG\x10\x06\x12\x13\n\x0f\x44\x41TADOG_APP_KEY\x10\x02\x12\x13\n\x0f\x44\x41TADOG_API_KEY\x10\x03\x12\x16\n\x12\x44\x41TADOG_AUTH_TOKEN\x10\x0f\x12\x16\n\x12\x44\x41TADOG_API_DOMAIN\x10\x12\x12\x14\n\x10NEWRELIC_API_KEY\x10\x04\x12\x13\n\x0fNEWRELIC_APP_ID\x10\x05\x12\x16\n\x12NEWRELIC_QUERY_KEY\x10\x07\x12\x17\n\x13NEWRELIC_API_DOMAIN\x10\x13\x12\x18\n\x14SLACK_BOT_AUTH_TOKEN\x10\x08\x12\x14\n\x10SLACK_CHANNEL_ID\x10\t\x12\x10\n\x0cSLACK_APP_ID\x10.\x12\x18\n\x14HONEYBADGER_USERNAME\x10\n\x12\x18\n\x14HONEYBADGER_PASSWORD\x10\x0b\x12\x1a\n\x16HONEYBADGER_PROJECT_ID\x10\x0c\x12\x12\n\x0e\x41WS_ACCESS_KEY\x10\r\x12\x12\n\x0e\x41WS_SECRET_KEY\x10\x0e\x12\x0e\n\nAWS_REGION\x10\x14\x12\x18\n\x14\x41WS_ASSUMED_ROLE_ARN\x10\x17\x12\x10\n\x0c\x45KS_ROLE_ARN\x10(\x12\x1f\n\x1bGOOGLE_CHAT_BOT_OAUTH_TOKEN\x10\x10\x12\x1a\n\x16GOOGLE_CHAT_BOT_SPACES\x10\x11\x12\x10\n\x0cGRAFANA_HOST\x10\x15\x12\x13\n\x0fGRAFANA_API_KEY\x10\x16\x12\x18\n\x14\x43LICKHOUSE_INTERFACE\x10\x18\x12\x13\n\x0f\x43LICKHOUSE_HOST\x10\x19\x12\x13\n\x0f\x43LICKHOUSE_PORT\x10\x1a\x12\x13\n\x0f\x43LICKHOUSE_USER\x10\x1b\x12\x17\n\x13\x43LICKHOUSE_PASSWORD\x10\x1c\x12\x12\n\x0eGCM_PROJECT_ID\x10\x1d\x12\x1c\n\x18GCM_SERVICE_ACCOUNT_JSON\x10\x1e\x12\x14\n\x10GCM_CLIENT_EMAIL\x10\x1f\x12\x11\n\rGCM_TOKEN_URI\x10 \x12\x11\n\rPOSTGRES_HOST\x10!\x12\x11\n\rPOSTGRES_USER\x10\"\x12\x15\n\x11POSTGRES_PASSWORD\x10#\x12\x11\n\rPOSTGRES_PORT\x10$\x12\x15\n\x11POSTGRES_DATABASE\x10%\x12\x14\n\x10POSTGRES_OPTIONS\x10&\x12&\n\"SQL_DATABASE_CONNECTION_STRING_URI\x10\'\x12\x16\n\x12PAGER_DUTY_API_KEY\x10)\x12\x1f\n\x1bPAGER_DUTY_CONFIGURED_EMAIL\x10?\x12\x15\n\x11OPS_GENIE_API_KEY\x10*\x12\x14\n\x10\x41GENT_PROXY_HOST\x10+\x12\x17\n\x13\x41GENT_PROXY_API_KEY\x10,\x12\x18\n\x14GITHUB_ACTIONS_TOKEN\x10-\x12\x13\n\x0fOPEN_AI_API_KEY\x10/\x12\x15\n\x11REMOTE_SERVER_PEM\x10\x31\x12\x16\n\x12REMOTE_SERVER_USER\x10\x32\x12\x16\n\x12REMOTE_SERVER_HOST\x10\x33\x12\x1a\n\x16REMOTE_SERVER_PASSWORD\x10\x34\x12\x0e\n\nMIMIR_HOST\x10\x35\x12\x12\n\x0eX_SCOPE_ORG_ID\x10\x36\x12\x0e\n\nSSL_VERIFY\x10\x37\x12\x19\n\x15\x41ZURE_SUBSCRIPTION_ID\x10\x38\x12\x13\n\x0f\x41ZURE_TENANT_ID\x10\x39\x12\x13\n\x0f\x41ZURE_CLIENT_ID\x10:\x12\x17\n\x13\x41ZURE_CLIENT_SECRET\x10;\x12\x12\n\x0eGKE_PROJECT_ID\x10<\x12\x1c\n\x18GKE_SERVICE_ACCOUNT_JSON\x10=\x12\"\n\x1eMS_TEAMS_CONNECTOR_WEBHOOK_URL\x10>\x12\x1b\n\x17\x45LASTIC_SEARCH_PROTOCOL\x10@\x12\x17\n\x13\x45LASTIC_SEARCH_HOST\x10\x41\x12\x17\n\x13\x45LASTIC_SEARCH_PORT\x10\x42\x12\x1d\n\x19\x45LASTIC_SEARCH_API_KEY_ID\x10\x43\x12\x1a\n\x16\x45LASTIC_SEARCH_API_KEY\x10\x44\x12\x19\n\x15GRAFANA_LOKI_PROTOCOL\x10\x45\x12\x15\n\x11GRAFANA_LOKI_HOST\x10\x46\x12\x15\n\x11GRAFANA_LOKI_PORT\x10G\x12\x1b\n\x17KUBERNETES_CLUSTER_NAME\x10H\x12!\n\x1dKUBERNETES_CLUSTER_API_SERVER\x10I\x12\x1c\n\x18KUBERNETES_CLUSTER_TOKEN\x10J\x12\x31\n-KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_DATA\x10K\x12\x31\n-KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_PATH\x10L\x12\r\n\tSMTP_HOST\x10M\x12\r\n\tSMTP_PORT\x10N\x12\r\n\tSMTP_USER\x10O\x12\x11\n\rSMTP_PASSWORD\x10P\x12\x18\n\x14\x42IG_QUERY_PROJECT_ID\x10Q\x12\"\n\x1e\x42IG_QUERY_SERVICE_ACCOUNT_JSON\x10R*\x9c\x08\n\x0fSourceModelType\x12\x0e\n\nUNKNOWN_MT\x10\x00\x12\x14\n\x10NEW_RELIC_POLICY\x10\x01\x12\x17\n\x13NEW_RELIC_CONDITION\x10\x02\x12\x14\n\x10NEW_RELIC_ENTITY\x10\x03\x12\x1e\n\x1aNEW_RELIC_ENTITY_DASHBOARD\x10\x04\x12 \n\x1cNEW_RELIC_ENTITY_APPLICATION\x10\x05\x12\x12\n\x0eNEW_RELIC_NRQL\x10\x06\x12\x13\n\x0f\x44\x41TADOG_MONITOR\x10\x65\x12\x15\n\x11\x44\x41TADOG_DASHBOARD\x10\x66\x12 \n\x1c\x44\x41TADOG_LIVE_INTEGRATION_AWS\x10g\x12$\n DATADOG_LIVE_INTEGRATION_AWS_LOG\x10h\x12\"\n\x1e\x44\x41TADOG_LIVE_INTEGRATION_AZURE\x10i\x12\'\n#DATADOG_LIVE_INTEGRATION_CLOUDFLARE\x10j\x12#\n\x1f\x44\x41TADOG_LIVE_INTEGRATION_FASTLY\x10k\x12 \n\x1c\x44\x41TADOG_LIVE_INTEGRATION_GCP\x10l\x12&\n\"DATADOG_LIVE_INTEGRATION_CONFLUENT\x10m\x12\x13\n\x0f\x44\x41TADOG_SERVICE\x10n\x12\x12\n\x0e\x44\x41TADOG_METRIC\x10o\x12\x11\n\rDATADOG_QUERY\x10p\x12\x16\n\x11\x43LOUDWATCH_METRIC\x10\xc9\x01\x12\x19\n\x14\x43LOUDWATCH_LOG_GROUP\x10\xca\x01\x12\x17\n\x12GRAFANA_DATASOURCE\x10\xad\x02\x12\x16\n\x11GRAFANA_DASHBOARD\x10\xae\x02\x12!\n\x1cGRAFANA_TARGET_METRIC_PROMQL\x10\xaf\x02\x12\"\n\x1dGRAFANA_PROMETHEUS_DATASOURCE\x10\xb0\x02\x12\x18\n\x13\x43LICKHOUSE_DATABASE\x10\x91\x03\x12\x12\n\rSLACK_CHANNEL\x10\xf5\x03\x12\r\n\x08MARKDOWN\x10\xd9\x04\x12\x0b\n\x06IFRAME\x10\xda\x04\x12\x13\n\x0ePOSTGRES_QUERY\x10\xbd\x05\x12\x10\n\x0b\x45KS_CLUSTER\x10\xa1\x06\x12&\n!SQL_DATABASE_CONNECTION_RAW_QUERY\x10\x85\x07\x12\x14\n\x0f\x41ZURE_WORKSPACE\x10\xe9\x07\x12\x0f\n\nSSH_SERVER\x10\xcc\x08\x12\x19\n\x14GRAFANA_MIMIR_PROMQL\x10\xb1\t\x12\x10\n\x0bGKE_CLUSTER\x10\x95\n\x12\x15\n\x10MS_TEAMS_CHANNEL\x10\xf9\n\x12\x17\n\x12PAGERDUTY_INCIDENT\x10\xdd\x0b\x12\x19\n\x14\x45LASTIC_SEARCH_INDEX\x10\xc1\x0c\x12\x0f\n\nGCM_METRIC\x10\xa5\rb\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.base_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _FUNCTION._serialized_start=1152
  _FUNCTION._serialized_end=1233
  _OPERATOR._serialized_start=1236
  _OPERATOR._serialized_end=1419
  _LOGICALOPERATOR._serialized_start=1421
  _LOGICALOPERATOR._serialized_end=1489
  _OP._serialized_start=1492
  _OP._serialized_end=1634
  _CONTEXT._serialized_start=1636
  _CONTEXT._serialized_end=1736
  _SOURCE._serialized_start=1739
  _SOURCE._serialized_end=2500
  _SOURCEKEYTYPE._serialized_start=2503
  _SOURCEKEYTYPE._serialized_end=4512
  _SOURCEMODELTYPE._serialized_start=4515
  _SOURCEMODELTYPE._serialized_end=5567
  _TIMERANGE._serialized_start=61
  _TIMERANGE._serialized_end=107
  _PAGE._serialized_start=109
  _PAGE._serialized_end=206
  _META._serialized_start=209
  _META._serialized_end=384
  _MESSAGE._serialized_start=386
  _MESSAGE._serialized_end=450
  _ERRORMESSAGE._serialized_start=452
  _ERRORMESSAGE._serialized_end=543
  _OPDESCRIPTION._serialized_start=545
  _OPDESCRIPTION._serialized_end=637
  _TASKCRONSCHEDULE._serialized_start=640
  _TASKCRONSCHEDULE._serialized_end=967
  _TASKINTERVAL._serialized_start=969
  _TASKINTERVAL._serialized_end=1042
  _TASKCRONRULE._serialized_start=1044
  _TASKCRONRULE._serialized_end=1150
# @@protoc_insertion_point(module_scope)
