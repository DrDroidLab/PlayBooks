import CustomButton from "../../common/CustomButton";
import { Tooltip } from "@mui/material";
import { DeleteRounded, EditRounded, StopRounded } from "@mui/icons-material";
import { useDeleteWorkflowMutation } from "../../../store/features/workflow/api";
import { useNavigate } from "react-router-dom";
import ActionOverlay from "./ActionOverlay";
import useToggle from "../../../hooks/common/useToggle";

type DynamicAlertActionsProps = {
  item: any;
};

function DynamicAlertActions({ item }: DynamicAlertActionsProps) {
  const { isOpen: isActionOpen, toggle } = useToggle();
  const navigate = useNavigate();

  const handleDelete = () => {
    toggle();
  };

  const handleStop = () => {};

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

      <CustomButton onClick={handleStop}>
        <Tooltip title="Stop Dynamic Alert">
          <StopRounded fontSize="small" />
        </Tooltip>
      </CustomButton>

      <ActionOverlay isOpen={isActionOpen} toggleOverlay={toggle} item={item} />
    </div>
  );
}

export default DynamicAlertActions;
