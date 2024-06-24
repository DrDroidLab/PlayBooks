import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";
import { Delete, VisibilityRounded } from "@mui/icons-material";
import RunButton from "../../Buttons/RunButton/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteStep,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function StepButtons({ stepId, handleClick }) {
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

  return (
    <div className="flex items-center gap-1 p-1">
      <CustomButton
        onClick={handleClick}
        className="text-violet-500 cursor-pointer">
        <Tooltip title={"Show Config"}>
          <VisibilityRounded fontSize="medium" />
        </Tooltip>
      </CustomButton>
      <div onClick={handleNoAction}>
        <RunButton id={step.id} showText={false} />
      </div>
      {isEditing && (
        <CustomButton onClick={handleDelete}>
          <Delete fontSize="medium" />
        </CustomButton>
      )}
    </div>
  );
}

export default StepButtons;
