import React from "react";
import { taskTypes } from "../../../constants/taskTypes.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import MarkdownOutput from "../card/MarkdownOutput.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function HandleDocumentationOutputs({ taskId }) {
  const [task] = useCurrentTask(taskId);
  const source = task?.source ?? "";
  const taskType = task?.[source.toLowerCase()]?.type ?? "";
  const type = `${source} ${taskType}`;
  const taskData = task?.[source.toLowerCase()][taskType.toLowerCase()];

  switch (type) {
    case taskTypes.DOCUMENTATION_IFRAME:
      return (
        <CustomInput
          inputType={InputTypes.IFRAME_RENDER}
          value={taskData?.iframe_url}
        />
      );
    case taskTypes.DOCUMENTATION_MARKDOWN:
      return <MarkdownOutput content={taskData?.content} />;
    default:
      return <></>;
  }
}

export default HandleDocumentationOutputs;
