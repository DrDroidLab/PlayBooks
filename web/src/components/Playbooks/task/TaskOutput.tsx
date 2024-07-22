import PlayBookRunMetricGraph from "../PlayBookRunMetricGraph.jsx";
import PlaybookAPIActionOutput from "../PlaybookAPIActionOutput.jsx";
import PlaybookBashActionOutput from "../PlaybookBashActionOutput.jsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import React from "react";
import HandleUnkownOutput from "./outputs/HandleUnkownOutput.tsx";
import PlayBookRunLogTable from "../PlayBookRunLogTable.tsx";
import PlayBookRunDataTable from "../PlayBookRunDataTable.jsx";
import handleTaskTypeLabels from "../../../utils/conditionals/handleTaskTypeLabels.ts";

const OutputTypes = {
  API_RESPONSE: "API_RESPONSE",
  BASH_COMMAND_OUTPUT: "BASH_COMMAND_OUTPUT",
  TIMESERIES: "TIMESERIES",
  TABLE: "TABLE",
  LOGS: "LOGS",
};

const TaskOutput = ({ id, showHeading, taskFromExecution }) => {
  const [taskFromPlaybook] = useCurrentTask(id);
  const task = taskFromExecution ?? taskFromPlaybook;
  const output = task?.ui_requirement.output?.data;
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
