import React from "react";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import { SOURCES } from "../../../../constants/index.ts";
import HandleDocumentationOutputs from "../../outputs/HandleDocumentationOutputs.tsx";
import PlayBookRunMetricGraph from "../../PlayBookRunMetricGraph.jsx";

function HandleUnkownOutput({ taskId, error }) {
  const [task] = useCurrentTask(taskId);

  switch (task?.source) {
    case SOURCES.TEXT:
      return <HandleDocumentationOutputs taskId={taskId} />;
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
