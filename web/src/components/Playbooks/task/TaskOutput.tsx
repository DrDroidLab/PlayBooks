import PlayBookRunMetricGraph from "../outputs/PlayBookRunMetricGraph.js";
import PlaybookAPIActionOutput from "../outputs/PlaybookAPIActionOutput.js";
import PlaybookBashActionOutput from "../outputs/PlaybookBashActionOutput.js";
import HandleUnkownOutput from "./outputs/HandleUnkownOutput.tsx";
import PlayBookRunLogTable from "../outputs/PlayBookRunLogTable.tsx";
import PlayBookRunDataTable from "../outputs/PlayBookRunDataTable.js";
import handleTaskTypeLabels from "../../../utils/conditionals/handleTaskTypeLabels.ts";

const OutputTypes = {
  API_RESPONSE: "API_RESPONSE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
  LOGS: "LOGS",
};

const TaskOutput = ({ id, showHeading, task, output, error }) => {
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
              : handleTaskTypeLabels(task).labelValue ??
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

    case OutputTypes.LOGS:
      return (
        <PlayBookRunLogTable
          title={"Results"}
          result={output}
          timestamp={output.timestamp}
          showHeading={showHeading}
        />
      );
    default:
      return <HandleUnkownOutput error={error} taskId={id} />;
  }
};

export default TaskOutput;
