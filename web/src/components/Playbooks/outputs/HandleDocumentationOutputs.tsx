import React from "react";
import { taskTypes } from "../../../constants/taskTypes.ts";
import IframeRender from "../options/IframeRender.tsx";
import Notes from "../steps/Notes.jsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

function HandleDocumentationOutputs({ taskId }) {
  const [task] = useCurrentTask(taskId);
  const source = task?.source ?? "";
  const taskType = task?.[source.toLowerCase()]?.type ?? "";
  const type = `${source} ${taskType}`;
  const taskData = task?.[source.toLowerCase()][taskType.toLowerCase()];

  switch (type) {
    case taskTypes.DOCUMENTATION_IFRAME:
      return <IframeRender url={taskData?.iframe_url} />;
    case taskTypes.DOCUMENTATION_MARKDOWN:
      return <Notes id={taskId} />;
    default:
      return <></>;
  }
}

export default HandleDocumentationOutputs;
