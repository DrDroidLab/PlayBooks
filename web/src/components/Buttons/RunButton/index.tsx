import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import { CircularProgress, Tooltip } from "@mui/material";
import { executeTask } from "../../../utils/execution/executeTask.ts";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";

type RunButtonProps = {
  id: string;
  showText?: boolean;
};

function RunButton({ id, showText = true }: RunButtonProps) {
  const [task] = useCurrentTask(id);
  const loading = task?.ui_requirement?.outputLoading;

  const handleExecuteTask = async () => {
    if (loading) return;
    if (task) executeTask(task.id);
  };

  if (!task?.source || unsupportedRunners.includes(task?.source ?? ""))
    return <></>;

  return (
    <Tooltip title="Run this Task">
      <>
        <CustomButton onClick={handleExecuteTask}>
          {showText && (loading ? "Running" : "Run")}
          {loading ? (
            <CircularProgress color="inherit" size={20} />
          ) : (
            <PlayArrowRounded fontSize="medium" />
          )}
        </CustomButton>
      </>
    </Tooltip>
  );
}

export default RunButton;
