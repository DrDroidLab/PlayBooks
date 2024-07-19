import React from "react";
import getCurrentTask from "../getCurrentTask.ts";

function handleErrorMessage(taskId: string): React.ReactNode | undefined {
  const [task] = getCurrentTask(taskId);
  if (task?.ui_requirement.outputError) {
    return <p>{task?.ui_requirement.outputError}</p>;
  }

  const errorKeys = Object.keys(task?.ui_requirement.errors ?? {});
  if (errorKeys.length === 0) return undefined;

  return errorKeys.map((key) => (
    <li>{task?.ui_requirement.errors[key].message}</li>
  ));
}

export default handleErrorMessage;
