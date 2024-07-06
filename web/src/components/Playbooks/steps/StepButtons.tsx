import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Add, Delete } from "@mui/icons-material";
import { Step } from "../../../types/index.ts";
import { useDispatch } from "react-redux";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import { deleteStep } from "../../../store/features/playbook/playbookSlice.ts";

const addDataId = DrawerTypes.ADD_DATA;

type StepButtonsProps = {
  step: Step;
};

function StepButtons({ step }: StepButtonsProps) {
  const dispatch = useDispatch();
  const { toggle: toggleAddData, addAdditionalData } =
    useDrawerState(addDataId);
  const { closeDrawer } = usePermanentDrawerState();

  const handleAddTask = () => {
    toggleAddData();
    addAdditionalData({ stepId: step?.id });
  };

  const handleDeleteStep = () => {
    dispatch(deleteStep(step.id));
    closeDrawer();
  };

  return (
    <div className="flex justify-between mt-2">
      <CustomButton onClick={handleAddTask}>
        <Add fontSize="small" />
        <p>Add Task</p>
      </CustomButton>

      {step.ui_requirement.stepIndex !== 0 && (
        <CustomButton onClick={handleDeleteStep}>
          <Delete />
        </CustomButton>
      )}
    </div>
  );
}

export default StepButtons;
