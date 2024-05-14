import { ModelTypeMap, ModelTypesOption } from "../../connectors/index.ts";
import { ExternalLink, GlobalVariable, PlaybookTask } from "../index.ts";
import { GoldenMetric } from "./index.ts";

export type Step = {
  name?: string;
  id?: string;
  query?: string;
  dimension?: string;
  namespace?: string;
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
  metric?: any;
  executioninprogress?: string;
  outputLoading?: boolean;
  showOutput?: boolean;
  outputError?: string;
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
  golden_metrics?: any[];
  nrqlData?: any;
  datadogService?: any;
  datadogMetricFamily?: string;
  datadogEnvironment?: string;
  datadogMetric?: any;
  command?: any;
  cluster?: string;
  isOpen: boolean;
  isPlayground: boolean;
  globalVariables?: GlobalVariable[];
  isCopied?: boolean;
  errors?: any;
  showError: boolean;
  eksRegion?: string;
  eksNamespace?: string;
  query1?: string;
  query2?: string;
  formula?: string;
  requiresFormula?: boolean;
  showExternalLinks?: boolean;
  stepType: string | null;
  action: any;
  connector_type?: any;
  model_type?: any;
  interpreter?: any;
  remote_server?: string;
};
