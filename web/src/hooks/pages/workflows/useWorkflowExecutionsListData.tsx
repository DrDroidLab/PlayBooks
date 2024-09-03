import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { renderTimestamp } from "../../../utils/common/dateUtils";
import { handleStatus } from "../../../utils/common/handleStatus";
import { ExecutionStatus } from "../../../types";
import { useStopWorkflowExecutionMutation } from "../../../store/features/workflow/api";
import { CircularProgress } from "@mui/material";
import { PowerSettingsNewRounded } from "@mui/icons-material";

export const useWorkflowExecutionsListData = (data: any[]) => {
  const navigate = useNavigate();
  const [selectedExecution, setSelectedExecution] = useState({});
  const [stopExecution, { isLoading: stopLoading }] =
    useStopWorkflowExecutionMutation();

  const handleViewExecutions = (item: any) => {
    navigate(`/workflows/logs/${item.workflow_run_id}`);
  };

  const handleStopExecution = (item: any) => {
    stopExecution({ workflow_run_id: item.workflow_run_id });
    window.location.reload(); // Refresh the page after stopping the execution
  };

  const actions = [
    {
      icon: null, // No icon, just a button with text
      label: "View Playbook Executions",
      action: handleViewExecutions,
      tooltip: "View the detailed executions of this workflow",
    },
    {
      icon: stopLoading ? (
        <CircularProgress size={20} />
      ) : (
        <PowerSettingsNewRounded fontSize="small" />
      ),
      label: "Stop Execution",
      action: handleStopExecution,
      tooltip: "Stop this execution",
      condition: (item: any) =>
        item.status === ExecutionStatus.WORKFLOW_RUNNING ||
        item.status === ExecutionStatus.WORKFLOW_SCHEDULED,
    },
  ];

  const rows = data?.map((item: any) => ({
    ...item,
    runId: (
      <Link
        to={`/workflows/logs/${item.workflow_run_id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.workflow_run_id}
      </Link>
    ),
    workflow: (
      <Link
        to={`/workflows/${item.workflow?.id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.workflow?.name}
      </Link>
    ),
    playbooks:
      item.workflow?.playbooks?.length > 0
        ? item.workflow.playbooks.map((e: any) => (
            <div
              className="p-1 text-xs border rounded bg-gray-50 w-fit transition-all"
              key={e.id}>
              <div>{e.name}</div>
            </div>
          ))
        : "--",
    startedAt: item.started_at ? renderTimestamp(item.started_at) : "--",
    status: handleStatus(item.status),
  }));

  return {
    rows,
    actions,
    selectedExecution,
  };
};

export default useWorkflowExecutionsListData;
