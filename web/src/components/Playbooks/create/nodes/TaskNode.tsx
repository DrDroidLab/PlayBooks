import React from "react";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import TaskTitle from "../../card/TaskTitle.tsx";
import handleTaskBorderColor from "../../../../utils/playbook/handleTaskBorderColor.ts";
import TaskInformation from "../../card/TaskInformation.tsx";

function TaskNode({ taskId }) {
  const [task] = useCurrentTask(taskId);
  console.log("task", task);

  const handleClick = () => {};

  return (
    <div
      onClick={handleClick}
      className={`rounded-md overflow-hidden border border-transparent`}
      style={{ borderColor: handleTaskBorderColor(taskId) }}>
      <TaskTitle taskId={task?.id} />
      <TaskInformation taskId={task?.id} />
    </div>
  );
}

export default TaskNode;
