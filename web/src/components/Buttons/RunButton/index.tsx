import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import useIsExisting from "../../../hooks/useIsExisting.ts";
import {
  currentPlaybookSelector,
  playbookSelector,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useSearchParams } from "react-router-dom";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import { executeTask } from "../../../utils/execution/executeTask.ts";

type RunButtonProps = {
  id: string;
  showText?: boolean;
};

function RunButton({ id, showText = true }: RunButtonProps) {
  const { executionId } = useSelector(playbookSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const [, setSearchParams] = useSearchParams();
  const [task] = useCurrentTask(id);
  const dispatch = useDispatch();
  const isExisting = useIsExisting();
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();
  const loading = task?.ui_requirement?.outputLoading || executionLoading;

  const handleStartExecution = async () => {
    if (executionId) return;
    if (!currentPlaybook?.id) return;
    const response = await triggerStartExecution(
      parseInt(currentPlaybook.id, 10),
    );
    if ("data" in response) {
      const { data } = response;
      return data.playbook_run_id;
    }
  };

  const handleExecuteTask = async () => {
    if (loading) return;
    // if (isExisting && !executionId && task?.ui_requirement.stepId) {
    //   const id = await handleStartExecution();
    //   dispatch(setPlaybookKey({ key: "executionId", value: id }));
    //   if (task) await executeTask(task.id);
    //   setSearchParams({ executionId: id });
    // } else {
    if (task) executeTask(task.id);
    // }
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
