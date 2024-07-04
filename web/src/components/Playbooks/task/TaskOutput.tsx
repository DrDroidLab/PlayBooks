import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph.jsx";
import PlayBookRunDataTable from "../PlayBookRunDataTable.jsx";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput.jsx";
import PlaybookBashActionOutput from "../PlaybookBashActionOutput.jsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import React from "react";
import HandleUnkownOutput from "./outputs/HandleUnkownOutput.tsx";

const OutputTypes = {
  API_RESPONSE: "API_RESPONSE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
};

const TaskOutput = ({ id, showHeading }) => {
  const [task] = useCurrentTask(id);
  const output = task?.ui_requirement.output.result;
  const error = task?.ui_requirement?.outputError;

  switch (output?.type) {
    case OutputTypes.API_RESPONSE:
      return <PlaybookAPIActionOutput output={output.api_response} />;
    case OutputTypes.BASH_COMMAND_OUTPUT:
      return <PlaybookBashActionOutput output={output.bash_command_output} />;
    case OutputTypes.TIMESERIES:
      return (
        <PlayBookRunMetricGraph
          result={output}
          timestamp={output.timestamp}
          error={error}
          title={
            error
              ? "Error from Source"
              : output?.timeseries?.metric_name ??
                "No data available for this step"
          }
        />
      );
    case OutputTypes.TABLE:
      return (
        <PlayBookRunDataTable
          title={"Results"}
          result={output}
          timestamp={output.timestamp}
          showHeading={showHeading}
        />
      );
    default:
      return <HandleUnkownOutput error={error} stepId={id} />;
  }
};

export default TaskOutput;
