import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import { CircularProgress, Tooltip } from "@mui/material";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  currentPlaybookSelector,
  playbookSelector,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep.ts";

type RunStepButtonProps = {
  id: string;
  showText?: boolean;
};

function RunStepButton({ id, showText = true }: RunStepButtonProps) {
  const { executionId } = useSelector(playbookSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const [, setSearchParams] = useSearchParams();
  const [step] = useCurrentStep(id);
  const dispatch = useDispatch();
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();
  const loading = step?.ui_requirement?.outputLoading || executionLoading;

  const handleNoAction = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

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

  const handleExecuteStep = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    handleNoAction(e);
    if (loading) return;
    if (!executionId) {
      const id = await handleStartExecution();
      if (id) dispatch(setPlaybookKey({ key: "executionId", value: id }));
      if (step) await executeStep(step.id);
      if (id) setSearchParams({ executionId: id });
    } else {
      if (step) executeStep(step.id);
    }
  };

  if (step?.tasks.length === 0) return;

  return (
    <Tooltip title="Run this Step">
      <>
        <CustomButton onClick={handleExecuteStep}>
          {showText && (loading ? "Running Step" : "Run Step")}
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

export default RunStepButton;
