import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { DeleteRounded, EditRounded } from "@mui/icons-material";
import { renderTimestamp } from "../../../utils/common/dateUtils";
import useToggle from "../../../hooks/common/useToggle";
import CustomButton from "../../../components/common/CustomButton";
import WorkflowRunButton from "../../../components/Buttons/WorkflowRunButton";
import { useState } from "react";

export const useDynamicAlertsData = (data: any[]) => {
  const navigate = useNavigate();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedItem, setSelectedItem] = useState<any>(undefined);

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    toggle();
  };

  const handleEdit = (item: any) => {
    navigate(`/dynamic-alerts/${item.id}`);
  };

  const actions = [
    {
      icon: <EditRounded fontSize="small" />,
      label: "Edit",
      action: handleEdit,
      tooltip: "Edit Dynamic Alert",
    },
    {
      icon: <DeleteRounded fontSize="small" />,
      label: "Delete",
      action: handleDelete,
      tooltip: "Delete Dynamic Alert Execution",
    },
  ];

  const rows = data?.map((item: any) => ({
    ...item,
    name: (
      <Link
        to={`/dynamic-alerts/${item.id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.name}
      </Link>
    ),
    createdAt: renderTimestamp(item.created_at),
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
    isActionOpen,
    toggle,
    item: selectedItem,
  };
};

export default useDynamicAlertsData;
