import { PlaybookTask } from './playbookTask';

export interface Step {
  name?: string;
  description?: string;
  externalLinks?: ExternalLink[];
  isPrefetched?: boolean;
  notes?: string;
  source: string;
  modelTypes?: ModelTypeMap[];
  modelType?: string;
  selectedSource?: string;
  modelTypeOptions?: ModelTypesOption[];
  namespaceName?: string;
  assets?: any;
  region?: string;
  dimensionName?: string;
  dimensionValue?: string;
  dimensionIndex?: number;
  metric?: string;
  executioninprogress?: string;
  outputLoading?: boolean;
  showOutput?: boolean;
  queryObj?: any;
  promql_label_option_values?: any;
  database?: string;
  db_query?: string;
  textNotes?: string;
  logGroup?: any;
  cw_log_query?: any;
  tasks?: PlaybookTask[];
  dashboard?: any;
  panel?: any;
  grafanaQuery?: any;
  options?: any;
  selectedOptions?: any;
  dbQuery?: string;
  page?: any;
  widget?: any;
  application_name?: string;
  golden_metric?: GoldenMetric;
  nrqlData?: any;
}

export interface ExternalLink {
  name: string;
  url: string;
}

export interface ModelTypeMap {
  model_type: string;
  display_name: string;
}

export interface ModelTypesOption {
  model_type: string;
  cloudwatch_metric_model_options?: CloudwatchMetricModelOptions;
  cloudwatch_log_group_model_options?: CloudwatchLogGroupModelOptions;
}

export interface GoldenMetric {
  golden_metric_name: string;
  golden_metric_unit: string;
  golden_metric_nrql_expression: string;
}

export interface CloudwatchMetricModelOptions {
  namespaces: string[];
}

export interface CloudwatchLogGroupModelOptions {
  regions: string[];
}
