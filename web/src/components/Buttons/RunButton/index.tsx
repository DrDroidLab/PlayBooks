import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import { CircularProgress, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import useIsExisting from "../../../hooks/useIsExisting.ts";
import {
  playbookSelector,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useSearchParams } from "react-router-dom";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

type RunButtonProps = {
  id: string;
  showText?: boolean;
};

function RunButton({ id, showText = true }: RunButtonProps) {
  const { executionId, currentPlaybook } = useSelector(playbookSelector);
  const [, setSearchParams] = useSearchParams();
  const [task] = useCurrentTask(id);
  const step = useCurrentStep(task?.ui_requirement.stepId);
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

  const handleExecuteStep = async () => {
    if (loading) return;
    if (isExisting && !executionId && task?.ui_requirement.stepId) {
      const id = await handleStartExecution();
      dispatch(setPlaybookKey({ key: "executionId", value: id }));
      if (step) await executeStep(step, step.id);
      setSearchParams({ executionId: id });
    } else {
      if (step) executeStep(step, step.id);
    }
  };

  if (!task?.source || unsupportedRunners.includes(task?.source ?? ""))
    return <></>;

  return (
    <Tooltip title="Run this Step">
      <>
        <CustomButton onClick={handleExecuteStep}>
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
