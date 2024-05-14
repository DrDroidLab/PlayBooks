import {
  CloudwatchLogGroupModelOptions,
  CloudwatchMetricModelOptions,
} from "./index.ts";

export type ModelTypesOption = {
  model_type: string;
  cloudwatch_metric_model_options?: CloudwatchMetricModelOptions;
  cloudwatch_log_group_model_options?: CloudwatchLogGroupModelOptions;
};
