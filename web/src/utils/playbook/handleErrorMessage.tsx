import React from "react";
import getCurrentTask from "./task/getCurrentTask.ts";

function handleErrorMessage(taskId: string): React.ReactNode | undefined {
  const [task] = getCurrentTask(taskId);
  const output = task?.ui_requirement?.outputs?.find((output: any) => {
    return output?.error !== undefined;
  });
  if (output?.error) {
    return <p>{output?.error}</p>;
  }

  const errorKeys = Object.keys(task?.ui_requirement.errors ?? {});
  if (errorKeys.length === 0) return undefined;

  return errorKeys.map((key) => (
    <li>{task?.ui_requirement.errors[key].message}</li>
  ));
}

export default handleErrorMessage;
