import { SOURCES } from "../../../../constants/index.ts";
import HandleDocumentationOutputs from "../../outputs/HandleDocumentationOutputs.tsx";
import PlayBookRunMetricGraph from "../../PlayBookRunMetricGraph.js";
import HandleSmtpOutput from "../../outputs/HandleSmtpOutput.tsx";
import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask.ts";

function HandleUnkownOutput({ taskId, error }) {
  const [task] = useCurrentTask(taskId);

  switch (task?.source) {
    case SOURCES.TEXT:
      return <HandleDocumentationOutputs taskId={taskId} />;
    case SOURCES.SMTP:
      return <HandleSmtpOutput />;
    default:
      return (
        <PlayBookRunMetricGraph
          error={error}
          title={
            error ? "Error from Source" : "No data available for this step"
          }
          result={null}
          timestamp={null}
        />
      );
  }
}

export default HandleUnkownOutput;
