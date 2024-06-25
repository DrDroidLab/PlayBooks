import React from "react";
import { Delete } from "@mui/icons-material";
import {
  deleteStep,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function DeleteStepButton({ stepId }) {
  const [step] = useCurrentStep(stepId);
  const dispatch = useDispatch();
  const { closeDrawer } = usePermanentDrawerState();
  const { executionId } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    dispatch(deleteStep(step.id));
    closeDrawer();
  };

  if (!isEditing) return;

  return (
    <button
      className="w-fit cursor-pointer text-violet-500 hover:text-gray-400"
      onClick={handleDelete}>
      <Delete fontSize="medium" />
    </button>
  );
}

export default DeleteStepButton;
