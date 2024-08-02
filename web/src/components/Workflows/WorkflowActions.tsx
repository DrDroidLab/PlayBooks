import {
  DeleteRounded,
  EditRounded,
  HistoryRounded,
  PlayArrowRounded,
  StopRounded,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import WorkflowActionOverlay from "./WorkflowActionOverlay";
import { useNavigate } from "react-router-dom";
import useToggle from "../../hooks/common/useToggle";
import { useState } from "react";
import CustomButton from "../common/CustomButton";
import WorkflowRunButton from "../Buttons/WorkflowRunButton";

type WorkflowActionProps = {
  item: any;
  refreshTable: Function;
};

function WorkflowActions({ item, refreshTable }: WorkflowActionProps) {
  const navigate = useNavigate();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedWorkflow, setSelectedWorkflow] = useState({});

  const handleDeleteWorkflow = () => {
    setSelectedWorkflow(item);
    toggle();
  };

  const handleEditWorkflow = () => {
    navigate(`/workflows/${item.id}`);
  };

  const handleExecutionHistory = () => {
    navigate(`/workflows/executions/${item.id}`);
  };

  return (
    <div className="flex gap-2">
      <CustomButton onClick={handleEditWorkflow}>
        <Tooltip title="Edit this Workflow">
          <EditRounded />
        </Tooltip>
      </CustomButton>
      <CustomButton onClick={handleDeleteWorkflow}>
        <Tooltip title="Remove this Workflow">
          <DeleteRounded />
        </Tooltip>
      </CustomButton>
      <CustomButton onClick={handleExecutionHistory}>
        <Tooltip title="View execution history">
          <HistoryRounded />
        </Tooltip>
      </CustomButton>
      <WorkflowRunButton item={item} />

      <WorkflowActionOverlay
        workflow={selectedWorkflow}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refreshTable}
      />
    </div>
  );
}

export default WorkflowActions;
