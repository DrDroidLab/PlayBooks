import { CircularProgress } from "@mui/material";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import { useEffect, useRef } from "react";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import React from "react";
import Task from "../task/Task.tsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function TaskDetailsDrawer() {
  const [task, currentTaskId] = useCurrentTask();
  const taskRef = useRef<HTMLDivElement>(null);
  const isPrefetched = useIsPrefetched();

  const handleUpdateStepName = (e) => {
    const val = e.target.value;
    updateCardById("description", e.target.value, currentTaskId);
    if (val.trim())
      updateCardById("userEnteredDescription", true, currentTaskId);
  };

  useEffect(() => {
    taskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [taskRef, currentTaskId]);

  if (Object.keys(task ?? {}).length === 0) return <>No Task Found</>;

  return (
    <div ref={taskRef} className="p-2 min-h-screen mb-16">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Title{" "}
        {task?.ui_requirement?.outputLoading && <CircularProgress size={20} />}
      </h2>

      <div className="flex items-center justify-between pr-2">
        <div className="w-full">
          <input
            className="border-gray-300 border rounded w-full p-1 text-sm font-bold text-gray-500"
            value={task?.description}
            onChange={handleUpdateStepName}
            disabled={!!isPrefetched}
          />
        </div>
      </div>
      {currentTaskId && <Task id={currentTaskId} />}
    </div>
  );
}

export default TaskDetailsDrawer;
