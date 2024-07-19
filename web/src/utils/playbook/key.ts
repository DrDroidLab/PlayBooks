export const Key = {
  METHOD: "method",
  URL: "url",
  HEADERS: "headers",
  PAYLOAD: "payload",
  TIMEOUT: "timeout",
  NAMESPACE: "namespace",
  REGION: "region",
  DIMENSION_NAME: "dimensions.0.name",
  DIMENSION_VALUE: "dimensions.0.value",
  METRIC_NAME: "metric_name",
  WORKSPACE_ID: "workspace_id",
  FILTER_QUERY: "filter_query",
  TIMESPAN: "timespan",
  COMMAND: "command",
  REMOTE_SERVER: "remote_server",
  DATABASE: "database",
  QUERY: "query",
  LOG_GROUP_NAME: "log_group_name",
  SERVICE_NAME: "service_name",
  ENVIRONMENT_NAME: "environment_name",
  METRIC_FAMILY: "metric_family",
  METRIC: "metric",
  PROCESS_FUNCTION: "process_function",
  QUERY1: "queries.0",
  QUERY2: "queries.1",
  FORMULA: "formula",
  CLUSTER: "cluster",
  INDEX: "index",
  LUCENE_QUERY: "lucene_query",
  LIMIT: "limit",
  OFFSET: "offset",
  SORT_DESC: "sort_desc",
  TIMESTAMP_FIELD: "timestamp_field",
  ZONE: "zone",
  DATASOURCE_UID: "datasource_uid",
  PROMQL_EXPRESSION: "promql_expression",
  START_TIME: "start_time",
  END_TIME: "end_time",
  IFRAME_URL: "iframe_url",
  APPLICATION_ENTITY_GUID: "application_entity_guid",
  APPLICATION_ENTITY_NAME: "application_entity_name",
  GOLDEN_METRIC_NAME: "golden_metric_name",
  GOLDEN_METRIC_NRQL_EXPRESSION: "golden_metric_nrql_expression",
  GOLDEN_METRIC_UNIT: "golden_metric_unit",
  APPLICATION_NAME: "application_name",
  DASHBOARD_GUID: "dashboard_guid",
  DASHBOARD_NAME: "dashboard_name",
  PAGE_GUID: "page_guid",
  PAGE_NAME: "page_name",
  PAGE_SIZE: "page_size",
  WIDGET_ID: "widget_id",
  WIDGET_TITLE: "widget_title",
  WIDGET_NRQL_EXPRESSION: "widget_nrql_expression",
  UNIT: "unit",
  NRQL_EXPRESSION: "nrql_expression",
  CONTENT: "content",
  ORDER_BY: "order_by"
} as const;

export type KeyType = (typeof Key)[keyof typeof Key];