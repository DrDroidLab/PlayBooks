import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import generateUUIDWithoutHyphens from "../../../utils/generateUUIDWithoutHyphens.ts";
import {
  addStep,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useZoom from "../../../hooks/useZoom.ts";

const addDataId = DrawerTypes.ADD_DATA;

function AddButtonOptions({ stepId }) {
  const [step] = useCurrentStep(stepId);
  const dispatch = useDispatch();
  const source = `node-${step?.id}`;
  const { toggle: toggleAddData, addAdditionalData } =
    useDrawerState(addDataId);
  const { openDrawer } = usePermanentDrawerState();
  const { executionId } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const { toolbarStyle } = useZoom();

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    toggleAddData();
    addAdditionalData({ parentId: step.id });
  };

  const handleAddWithCondition = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    const parentId = step.id;

    const id = generateUUIDWithoutHyphens();
    dispatch(addStep({ parentId: step?.id, addConditions: true, id }));
    addAdditionalData({
      source,
      id: `edge-${parentId}-${id}`,
    });
    openDrawer(PermanentDrawerTypes.CONDITION);
  };

  return (
    <div style={toolbarStyle}>
      <CustomButton
        onClick={handleNoAction}
        className="rounded-full w-8 h-8 flex items-center justify-center p-0 text-xl add-button hover:rotate-45">
        <Add fontSize="small" />
      </CustomButton>

      <div className="absolute top-0 left-full add-step-buttons transition-all">
        <div className="flex flex-col gap-2 m-2 mt-0">
          <CustomButton className="w-fit" onClick={handleAdd}>
            Add Step
          </CustomButton>
          <CustomButton
            onClick={handleAddWithCondition}
            className="whitespace-nowrap">
            Add Step with Condition
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default AddButtonOptions;
