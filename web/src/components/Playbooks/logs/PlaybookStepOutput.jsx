import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph";
import PlayBookRunDataTable from "../PlayBookRunDataTable";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput";

const PlaybookStepOutput = ({ stepOutput, error, step }) => {
  const out = stepOutput;

  return (
    <div style={{ marginTop: "5px" }}>
      {out?.task_execution_result?.metric_task_execution_result?.result
        ?.timeseries && (
        <PlayBookRunMetricGraph
          title={"Results"}
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
      {out?.task_execution_result?.action_task_execution_result?.result
        ?.api_response && (
        <PlaybookAPIActionOutput
          result={
            out?.task_execution_result?.action_task_execution_result?.result
          }
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {(!out ||
        (!out?.task_execution_result?.metric_task_execution_result?.result
          ?.timeseries &&
          !out?.task_execution_result?.metric_task_execution_result?.result
            ?.table_result?.rows &&
          !out?.task_execution_result?.data_fetch_task_execution_result?.result
            ?.table_result?.rows &&
          !out?.task_execution_result?.action_task_execution_result?.result
            ?.api_response)) && (
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
