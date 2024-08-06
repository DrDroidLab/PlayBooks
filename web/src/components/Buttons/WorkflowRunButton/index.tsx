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

  const handleExecution = async () => {
    let response: any;
    switch (status) {
      case ExecutionStatus.WORKFLOW_RUNNING:
      case ExecutionStatus.WORKFLOW_SCHEDULED:
        response = await triggerStopWorkflow({ workflow_id: id }).unwrap();
        break;
      default:
        response = await triggerStartWorkflow(id).unwrap();
        break;
    }
    if (response.success) window.location.reload();
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
