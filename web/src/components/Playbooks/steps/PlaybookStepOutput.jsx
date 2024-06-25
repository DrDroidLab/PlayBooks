import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph";
import PlayBookRunDataTable from "../PlayBookRunDataTable";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput";
import PlaybookBashActionOutput from "../PlaybookBashActionOutput";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import HandleUnkownOutput from "../HandleUnkownOutput.tsx";

const OutputTypes = {
  API_RESPONSE: "API_RESPONSE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
};

const PlaybookStepOutput = ({ stepOutput, showHeading, stepId }) => {
  const [step] = useCurrentStep(stepId);
  const out = stepOutput?.result;
  const error = step?.outputError ?? out?.error;

  switch (out?.type) {
    case OutputTypes.API_RESPONSE:
      return <PlaybookAPIActionOutput output={out.api_response} />;
    case OutputTypes.BASH_COMMAND_OUTPUT:
      return <PlaybookBashActionOutput output={out.bash_command_output} />;
    case OutputTypes.TIMESERIES:
      return (
        <PlayBookRunMetricGraph
          result={out}
          timestamp={out.timestamp}
          step={step}
          title={
            error
              ? "Error from Source"
              : out?.timeseries?.metric_name ??
                "No data available for this step"
          }
        />
      );
    case OutputTypes.TABLE:
      return (
        <PlayBookRunDataTable
          title={"Results"}
          result={out}
          timestamp={out.timestamp}
          showHeading={showHeading}
          step={step}
        />
      );
    default:
      return (
        <HandleUnkownOutput
          error={error}
          stepId={stepId}
          showHeading={showHeading}
        />
      );
  }
};

export default PlaybookStepOutput;
