import { Tooltip } from "rsuite";
import CustomButton from "../../common/CustomButton";
import { ExecutionStatus } from "../../../types";
import { PlayArrowRounded, StopRounded } from "@mui/icons-material";
import {
  useStartWorkflowExecutionMutation,
  useStopWorkflowExecutionMutation,
} from "../../../store/features/workflow/api";
import { CircularProgress } from "@mui/material";

type WorkflowRunButtonProps = {
  item: any;
};

function WorkflowRunButton({ item }: WorkflowRunButtonProps) {
  const status: ExecutionStatus = item.last_execution_status;
  const [triggerStartWorkflow, { isLoading: startExecutionLoading }] =
    useStartWorkflowExecutionMutation();
  const [triggerStopWorkflow, { isLoading: stopExecutionLoading }] =
    useStopWorkflowExecutionMutation();

  const isLoading = startExecutionLoading || stopExecutionLoading;

  const handleExecutionRun = () => {
    switch (status) {
      case ExecutionStatus.RUNNING:
        triggerStopWorkflow("");
        return;
      default:
        triggerStartWorkflow(item.id);
        return;
    }
  };

  return (
    <CustomButton onClick={handleExecutionRun}>
      <Tooltip
        title={
          status === ExecutionStatus.WORKFLOW_RUNNING ||
          status === ExecutionStatus.WORKFLOW_SCHEDULED
            ? "Stop workflow execution"
            : "Start workflow execution"
        }>
        {isLoading ? (
          <CircularProgress size={15} />
        ) : status === ExecutionStatus.RUNNING ? (
          <StopRounded />
        ) : (
          <PlayArrowRounded />
        )}
      </Tooltip>
    </CustomButton>
  );
}

export default WorkflowRunButton;
