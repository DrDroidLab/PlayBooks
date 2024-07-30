import React from "react";
import { Delete } from "@mui/icons-material";
import { deleteStep } from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch } from "react-redux";
import CustomButton from "../../common/CustomButton/index.tsx";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep.ts";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";

function DeleteStepButton({ id }) {
  const [step, currentStepId] = useCurrentStep(id);
  const dispatch = useDispatch();
  const { closeDrawer } = usePermanentDrawerState();

  const handleNoAction = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleNoAction(e);
    dispatch(deleteStep(currentStepId));
    closeDrawer();
  };

  if (step?.ui_requirement?.stepIndex === 0) return;

  return (
    <CustomButton onClick={handleDelete}>
      <Delete fontSize="medium" />
    </CustomButton>
  );
}

export default DeleteStepButton;
