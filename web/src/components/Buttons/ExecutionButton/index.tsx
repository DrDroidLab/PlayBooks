import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded, StopCircleRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  playbookSelector,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function ExecutionButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPlaybook = useSelector(playbookSelector);
  const { steps } = useSelector(playbookSelector);
  const [step] = useCurrentStep(steps?.length > 0 ? steps[0].id : undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();

  const handleStartExecution = async () => {
    if (executionId) return;
    const response = await triggerStartExecution(currentPlaybook.id);
    if ("data" in response) {
      const { data } = response;
      const id = data.playbook_run_id;
      dispatch(setPlaybookKey({ key: "executionId", value: id }));
      if (step) await executeStep(step, step.id);
      setSearchParams({ executionId: data.playbook_run_id });
    }
  };

  const handleStopExecution = () => {
    if (!executionId) return;
    navigate(`/playbooks/${currentPlaybook.id}`, { replace: true });
  };

  return (
    <>
      {executionLoading && (
        <CircularProgress
          style={{
            textAlign: "center",
          }}
          size={20}
        />
      )}
      {executionId ? (
        <CustomButton onClick={handleStopExecution}>
          <StopCircleRounded />
          <span>Stop</span>
        </CustomButton>
      ) : (
        <CustomButton onClick={handleStartExecution}>
          <PlayArrowRounded />
          <span>Start</span>
        </CustomButton>
      )}
    </>
  );
}

export default ExecutionButton;
