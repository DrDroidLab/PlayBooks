export type TaskExecutionConfiguration = {
  is_bulk_execution?: boolean;
  bulk_execution_var_field?: string;
  timeseries_offsets?: string[];
  result_transformer_lambda_function?: {
    definition: string;
  };
};
