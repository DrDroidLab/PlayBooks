import { CircularProgress } from "@mui/material";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import { useEffect, useRef } from "react";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import React from "react";
import Task from "../task/Task.tsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function TaskDetailsDrawer() {
  const [task, currentTaskId] = useCurrentTask();
  const taskRef = useRef<HTMLDivElement>(null);
  const isPrefetched = useIsPrefetched();

  const handleUpdateStepName = (val: string) => {
    updateCardById("description", val, currentTaskId);
    if (val.trim())
      updateCardById("userEnteredDescription", true, currentTaskId);
  };

  useEffect(() => {
    taskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [taskRef, currentTaskId]);

  if (Object.keys(task ?? {}).length === 0) return <>No Task Found</>;

  return (
    <div ref={taskRef} className="p-2 min-h-screen mb-16 w-full">
      <h2 className="font-bold mb-2 flex items-center gap-2 justify-between mr-2">
        Title{" "}
        {task?.ui_requirement?.outputLoading && <CircularProgress size={20} />}
      </h2>

      <CustomInput
        inputType={InputTypes.TEXT}
        value={task?.description ?? ""}
        handleChange={handleUpdateStepName}
        disabled={!!isPrefetched}
        className="!w-full"
        containerClassName="w-full"
        placeholder="Enter task name"
      />
      {currentTaskId && <Task id={currentTaskId} />}
    </div>
  );
}

export default TaskDetailsDrawer;
