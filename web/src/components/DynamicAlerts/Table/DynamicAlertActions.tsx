import CustomButton from "../../common/CustomButton";
import { Tooltip } from "@mui/material";
import { DeleteRounded, EditRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ActionOverlay from "./ActionOverlay";
import useToggle from "../../../hooks/common/useToggle";
import WorkflowRunButton from "../../Buttons/WorkflowRunButton";

type DynamicAlertActionsProps = {
  item: any;
};

function DynamicAlertActions({ item }: DynamicAlertActionsProps) {
  const { isOpen: isActionOpen, toggle } = useToggle();
  const navigate = useNavigate();

  const handleDelete = () => {
    toggle();
  };

  const handleEdit = () => {
    navigate(`/dynamic-alerts/${item.id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <CustomButton onClick={handleEdit}>
        <Tooltip title="Edit Dynamic Alert">
          <EditRounded fontSize="small" />
        </Tooltip>
      </CustomButton>

      <CustomButton onClick={handleDelete}>
        <Tooltip title="Delete Dynamic Alert Execution">
          <DeleteRounded fontSize="small" />
        </Tooltip>
      </CustomButton>
      <WorkflowRunButton id={item.id} status={item.last_execution_status} />

      <ActionOverlay isOpen={isActionOpen} toggleOverlay={toggle} item={item} />
    </div>
  );
}

export default DynamicAlertActions;
