import CustomButton from "../../common/CustomButton";
import { Tooltip } from "rsuite";
import { PlayArrowRounded, StopRounded } from "@mui/icons-material";
import { ExecutionStatus } from "../../../types";
import {
  useStartWorkflowExecutionMutation,
  useStopWorkflowExecutionMutation,
} from "../../../store/features/workflow/api";
import { CircularProgress } from "@mui/material";

type WorkflowRunButtonProps = {
  status: ExecutionStatus;
  id: string;
};

function WorkflowRunButton({ status, id }: WorkflowRunButtonProps) {
  const [triggerStartWorkflow, { isLoading: startExecutionLoading }] =
    useStartWorkflowExecutionMutation();
  const [triggerStopWorkflow, { isLoading: stopExecutionLoading }] =
    useStopWorkflowExecutionMutation();
  const loading = startExecutionLoading || stopExecutionLoading;
  const showStop =
    status === ExecutionStatus.RUNNING ||
    status === ExecutionStatus.WORKFLOW_SCHEDULED;

  const handleExecution = () => {
    switch (status) {
      case ExecutionStatus.WORKFLOW_RUNNING:
      case ExecutionStatus.WORKFLOW_SCHEDULED:
        triggerStopWorkflow("");
        return;
      default:
        triggerStartWorkflow(id);
        return;
    }
  };

  return (
    <CustomButton onClick={handleExecution}>
      <Tooltip title={showStop ? "Stop Execution" : "Start Execution"}>
        {loading ? (
          <CircularProgress size={20} />
        ) : showStop ? (
          <StopRounded fontSize="small" />
        ) : (
          <PlayArrowRounded fontSize="small" />
        )}
      </Tooltip>
    </CustomButton>
  );
}

export default WorkflowRunButton;
