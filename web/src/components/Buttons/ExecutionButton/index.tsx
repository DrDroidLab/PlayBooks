import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded, StopCircleRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useStartExecutionMutation } from "../../../store/features/playbook/api/index.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";

function ExecutionButton() {
  const navigate = useNavigate();
  const currentPlaybook = useSelector(playbookSelector);
  const [searchParams, setSearchParams] = useSearchParams();
  const executionId = searchParams.get("executionId");
  const [triggerStartExecution, { isLoading: executionLoading }] =
    useStartExecutionMutation();

  const handleStartExecution = async () => {
    if (executionId) return;
    const response = await triggerStartExecution(currentPlaybook.id);
    if ("data" in response) {
      const { data } = response;
      setSearchParams({ executionId: data.playbook_run_id });
    }
  };

  const handleStopExecution = () => {
    if (!executionId) return;
    navigate(-1);
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
          <span>Stop Execution</span>
        </CustomButton>
      ) : (
        <CustomButton onClick={handleStartExecution}>
          <PlayArrowRounded />
          <span>Start Execution</span>
        </CustomButton>
      )}
    </>
  );
}

export default ExecutionButton;
