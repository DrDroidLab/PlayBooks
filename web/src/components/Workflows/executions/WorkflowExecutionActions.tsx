import { useNavigate } from "react-router-dom";
import CustomButton from "../../common/CustomButton";
import { ExecutionStatus } from "../../../types";
import { useStopWorkflowExecutionMutation } from "../../../store/features/workflow/api";
import { CircularProgress, Tooltip } from "@mui/material";
import { PowerSettingsNewRounded } from "@mui/icons-material";

type WorkflowExecutionActionsProps = {
  item: any;
};

function WorkflowExecutionActions({ item }: WorkflowExecutionActionsProps) {
  const navigate = useNavigate();
  const [stopExecution, { isLoading: stopLoading }] =
    useStopWorkflowExecutionMutation();

  const handleViewExecutions = () => {
    navigate(`/workflows/logs/${item.workflow_run_id}`);
  };

  const handleStopExecution = () => {
    stopExecution({ workflow_run_id: item.workflow_run_id });
    window.location.reload();
  };

  const showStop =
    item.status === ExecutionStatus.WORKFLOW_RUNNING ||
    item.status === ExecutionStatus.WORKFLOW_SCHEDULED;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CustomButton onClick={handleViewExecutions}>
        View Playbook Executions
      </CustomButton>
      {showStop && (
        <CustomButton onClick={handleStopExecution}>
          <Tooltip title="Stop Execution">
            {stopLoading ? (
              <CircularProgress size={20} />
            ) : (
              <PowerSettingsNewRounded fontSize="small" />
            )}
          </Tooltip>
        </CustomButton>
      )}
    </div>
  );
}

export default WorkflowExecutionActions;
