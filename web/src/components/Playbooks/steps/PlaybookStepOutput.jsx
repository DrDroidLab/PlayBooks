import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph";
import PlayBookRunDataTable from "../PlayBookRunDataTable";
import PlaybookActionOutput from "../PlaybookActionOutput";

const PlaybookStepOutput = ({ stepOutput, error, step }) => {
  const out = stepOutput;

  return (
    <div style={{ marginTop: "5px" }}>
      {out?.task_execution_result?.metric_task_execution_result?.result
        ?.timeseries && (
        <PlayBookRunMetricGraph
          title={
            out?.task_execution_result?.metric_task_execution_result
              ?.metric_expression || "Results"
          }
          result={out.task_execution_result.metric_task_execution_result.result}
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.task_execution_result?.metric_task_execution_result?.result
        ?.table_result?.rows && (
        <PlayBookRunDataTable
          title={"Results"}
          result={out.task_execution_result.metric_task_execution_result.result}
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.task_execution_result?.data_fetch_task_execution_result?.result
        ?.table_result?.rows && (
        <PlayBookRunDataTable
          title={"Results"}
          result={
            out.task_execution_result.data_fetch_task_execution_result.result
          }
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.task_execution_result?.action_task_execution_result?.result && (
        <PlaybookActionOutput
          result={
            out?.task_execution_result?.action_task_execution_result?.result
          }
        />
      )}
      {(!out ||
        (!out?.task_execution_result?.metric_task_execution_result?.result
          ?.timeseries &&
          !out?.task_execution_result?.metric_task_execution_result?.result
            ?.table_result?.rows &&
          !out?.task_execution_result?.data_fetch_task_execution_result?.result
            ?.table_result?.rows &&
          !out?.task_execution_result?.action_task_execution_result
            ?.result)) && (
        <PlayBookRunMetricGraph
          error={error}
          title={
            error ? "Error from Source" : "No data available for this step"
          }
        />
      )}
    </div>
  );
};

export default PlaybookStepOutput;
