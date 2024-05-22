import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph";
import PlayBookRunDataTable from "../PlayBookRunDataTable";
import PlaybookActionOutput from "../PlaybookActionOutput";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput";
import PlaybookBashActionOutput from "../PlaybookBashActionOutput";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

const OutputTypes = {
  API_RESPONSE: "API_RESPONSE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
};

const PlaybookStepOutput = ({ stepOutput }) => {
  const [step] = useCurrentStep();
  const error = step.outputError;
  const out = stepOutput.result;

  switch (out.type) {
    case OutputTypes.API_RESPONSE:
      return <PlaybookAPIActionOutput output={out.api_response} />;
    case OutputTypes.BASH_COMMAND_OUTPUT:
      return <PlaybookBashActionOutput output={out.bash_command_output} />;
    default:
      return (
        <PlayBookRunMetricGraph
          error={error}
          title={
            error ? "Error from Source" : "No data available for this step"
          }
        />
      );
  }

  // return (
  //   <div style={{ marginTop: "5px" }}>
  //     {out?.metric_task_execution_result?.result?.timeseries && (
  //       <PlayBookRunMetricGraph
  //         title={
  //           out?.metric_task_execution_result?.metric_expression || "Results"
  //         }
  //         result={out.metric_task_execution_result.result}
  //         timestamp={out.timestamp}
  //         step={step}
  //       />
  //     )}
  //     {out?.metric_task_execution_result?.result?.table_result?.rows && (
  //       <PlayBookRunDataTable
  //         title={"Results"}
  //         result={out.metric_task_execution_result.result}
  //         timestamp={out.timestamp}
  //         step={step}
  //       />
  //     )}
  //     {out?.data_fetch_task_execution_result?.result?.table_result?.rows && (
  //       <PlayBookRunDataTable
  //         title={"Results"}
  //         result={out.data_fetch_task_execution_result.result}
  //         timestamp={out.timestamp}
  //         step={step}
  //       />
  //     )}
  //     {out?.action_task_execution_result?.result && (
  //       <PlaybookActionOutput
  //         result={out?.action_task_execution_result?.result}
  //       />
  //     )}
  //     {out.type === "API_RESPONSE" && (
  //       <PlaybookAPIActionOutput output={out.api_response} />
  //     )}
  //     {(!out ||
  //       (!out?.metric_task_execution_result?.result?.timeseries &&
  //         !out?.metric_task_execution_result?.result?.table_result?.rows &&
  //         !out?.data_fetch_task_execution_result?.result?.table_result?.rows &&
  //         !out?.action_task_execution_result?.result)) && (
  //       <PlayBookRunMetricGraph
  //         error={error}
  //         title={
  //           error ? "Error from Source" : "No data available for this step"
  //         }
  //       />
  //     )}
  //   </div>
  // );
};

export default PlaybookStepOutput;
