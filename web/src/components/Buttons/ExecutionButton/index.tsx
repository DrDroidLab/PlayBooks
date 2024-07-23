import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded, StopCircleRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  currentPlaybookSelector,
  setPlaybookKey,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { useUpdateExecutionStatusMutation } from "../../../store/features/playbook/api/executions/updateExecutionStatusApi.ts";
import { ExecutionStatus } from "../../../types/ExecutionStatus.ts";

function ExecutionButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const steps = currentPlaybook?.steps ?? [];
  const [step] = useCurrentStep(steps?.[0]?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();
  const [triggerStopExecution, { isLoading: stopLoading }] =
    useUpdateExecutionStatusMutation();
  const [loading, setLoading] = useState(false);

  const handleStartExecution = async () => {
    if (loading) return;
    if (!currentPlaybook?.id) return;
    setLoading(true);
    if (executionId) {
      dispatch(setPlaybookKey({ key: "executionId", value: executionId }));
      if (step) await executeStep(step.id);
      setSearchParams({ executionId: executionId });
      setLoading(false);
      window.location.reload();
      return;
    }
    const response = await triggerStartExecution(
      parseInt(currentPlaybook.id, 10),
    );
    if ("data" in response) {
      const { data } = response;
      const id = data.playbook_run_id;
      dispatch(setPlaybookKey({ key: "executionId", value: id }));
      if (step) await executeStep(step.id);
      setSearchParams({ executionId: data.playbook_run_id });
    }
    setLoading(false);
  };

  const handleStopExecution = async () => {
    if (!executionId) return;
    await triggerStopExecution({ playbook_run_id: executionId });
    navigate(`/playbooks/${currentPlaybook?.id}`, { replace: true });
  };

  const showStop =
    currentPlaybook?.ui_requirement.executionStatus !==
      ExecutionStatus.CREATED && executionId;

  return (
    <>
      {(executionLoading || stopLoading || loading) && (
        <CircularProgress
          style={{
            textAlign: "center",
          }}
          size={20}
        />
      )}
      {showStop ? (
        <CustomButton onClick={handleStopExecution}>
          <StopCircleRounded />
          <span>Stop</span>
        </CustomButton>
      ) : (
        <CustomButton onClick={handleStartExecution}>
          <PlayArrowRounded />
          <span>{loading ? "Executing..." : "Start"}</span>
        </CustomButton>
      )}
    </>
  );
}

export default ExecutionButton;
