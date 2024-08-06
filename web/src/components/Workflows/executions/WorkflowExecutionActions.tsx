import { useNavigate } from "react-router-dom";
import CustomButton from "../../common/CustomButton";

type WorkflowExecutionActionsProps = {
  item: any;
};

function WorkflowExecutionActions({ item }: WorkflowExecutionActionsProps) {
  const navigate = useNavigate();

  const handleViewExecutions = () => {
    navigate(`/workflows/logs/${item.workflow_run_id}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CustomButton onClick={handleViewExecutions}>
        View Playbook Executions
      </CustomButton>
    </div>
  );
}

export default WorkflowExecutionActions;
