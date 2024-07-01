import React from "react";
import { cardsData } from "../../../utils/cardsData.js";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import TaskButtons from "./TaskButtons.tsx";
import HandleTaskIcon from "./HandleTaskIcon.tsx";

function TaskTitle({ taskId }) {
  const [task] = useCurrentTask(taskId);

  console.log("task", task);
  return (
    <div className="bg-gray-200 flex items-center justify-between p-2 w-[300px]">
      <div className="flex items-center gap-1">
        {task?.source && (
          <img
            className="w-8 h-8"
            src={cardsData.find((e) => e.enum === task?.source)?.url ?? ""}
            alt="logo"
          />
        )}
        <HandleTaskIcon taskId={task?.id} />
        <p className="text-sm font-semibold break-word line-clamp-2">
          {task?.description}
        </p>
      </div>
      <TaskButtons taskId={task?.id} />
    </div>
  );
}

export default TaskTitle;
