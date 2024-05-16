import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph";
import PlayBookRunDataTable from "../PlayBookRunDataTable";
import PlaybookActionOutput from "../PlaybookActionOutput";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput";

const PlaybookStepOutput = ({ stepOutput, error, step }) => {
  const out = stepOutput.result;

  return (
    <div style={{ marginTop: "5px" }}>
      {out?.metric_task_execution_result?.result?.timeseries && (
        <PlayBookRunMetricGraph
          title={
            out?.metric_task_execution_result?.metric_expression || "Results"
          }
          result={out.metric_task_execution_result.result}
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.metric_task_execution_result?.result?.table_result?.rows && (
        <PlayBookRunDataTable
          title={"Results"}
          result={out.metric_task_execution_result.result}
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.data_fetch_task_execution_result?.result?.table_result?.rows && (
        <PlayBookRunDataTable
          title={"Results"}
          result={out.data_fetch_task_execution_result.result}
          timestamp={out.timestamp}
          step={step}
        />
      )}
      {out?.action_task_execution_result?.result && (
        <PlaybookActionOutput
          result={out?.action_task_execution_result?.result}
        />
      )}
      {out.type === "API_RESPONSE" && (
        <PlaybookAPIActionOutput output={out.api_response} />
      )}
      {(!out ||
        (!out?.metric_task_execution_result?.result?.timeseries &&
          !out?.metric_task_execution_result?.result?.table_result?.rows &&
          !out?.data_fetch_task_execution_result?.result?.table_result?.rows &&
          !out?.action_task_execution_result?.result)) && (
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
