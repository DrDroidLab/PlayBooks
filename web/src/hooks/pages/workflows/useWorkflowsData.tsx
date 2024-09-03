import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DeleteRounded,
  EditRounded,
  HistoryRounded,
} from "@mui/icons-material";
import { renderTimestamp } from "../../../utils/common/dateUtils";
import { handleStatus } from "../../../utils/common/handleStatus";
import useToggle from "../../common/useToggle";
import WorkflowRunButton from "../../../components/Buttons/WorkflowRunButton";

export const useWorkflowsData = (data: any[], refreshTable: () => void) => {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState({});
  const { isOpen: isActionOpen, toggle } = useToggle();

  const handleDeleteWorkflow = (item: any) => {
    setSelectedWorkflow(item);
    toggle();
  };

  const handleEditWorkflow = (item: any) => {
    navigate(`/workflows/${item.id}`);
  };

  const handleExecutionHistory = (item: any) => {
    navigate(`/workflows/executions/${item.id}`);
  };

  const actions = [
    {
      icon: <EditRounded />,
      label: "Edit",
      action: handleEditWorkflow,
    },
    {
      icon: <DeleteRounded />,
      label: "Delete",
      action: handleDeleteWorkflow,
    },
    {
      icon: <HistoryRounded />,
      label: "Execution History",
      action: handleExecutionHistory,
    },
  ];

  const rows = data?.map((item: any) => ({
    ...item,
    name: (
      <Link
        to={`/workflows/${item.id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.name}
      </Link>
    ),
    playbooks:
      item.playbooks?.length > 0
        ? item.playbooks.map((e: any) => (
            <div
              className="p-1 text-xs border rounded bg-gray-50 cursor-pointer w-fit transition-all"
              key={e.id}>
              <p>{e.name}</p>
            </div>
          ))
        : "--",
    schedule: (
      <div className="flex flex-col text-xs gap-1">
        <span className="text-sm font-bold">{item.schedule?.type}</span>
        {item.schedule?.periodic?.cron_rule && (
          <span className="border bg-gray-50 w-fit p-1 font-bold">
            {item.schedule?.periodic?.cron_rule?.rule}
          </span>
        )}
        {item.schedule?.periodic?.duration_in_seconds && (
          <span className="border bg-gray-50 w-fit p-1">
            For {item.schedule?.periodic?.duration_in_seconds} seconds
          </span>
        )}
      </div>
    ),
    lastExecutionTime: item.last_execution_time
      ? renderTimestamp(item?.last_execution_time)
      : "--",
    lastExecutionStatus: item.last_execution_status
      ? handleStatus(item.last_execution_status)
      : "--",
    createdBy: item.created_by,
    run: (
      <div className="flex justify-end">
        <WorkflowRunButton id={item.id} status={item.last_execution_status} />
      </div>
    ),
  }));

  return {
    rows,
    actions,
    selectedWorkflow,
    isActionOpen,
    toggle,
  };
};

export default useWorkflowsData;
