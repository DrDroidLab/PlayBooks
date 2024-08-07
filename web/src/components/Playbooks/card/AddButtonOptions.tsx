import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import generateUUIDWithoutHyphens from "../../../utils/common/generateUUIDWithoutHyphens.ts";
import {
  addStep,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import useDrawerState from "../../../hooks/common/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import useZoom from "../../../hooks/playbooks/useZoom.ts";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";

const addDataId = DrawerTypes.ADD_DATA;

function AddButtonOptions({ stepId }) {
  const source = `node-${stepId}`;
  const { toggle: toggleAddData, addAdditionalData } =
    useDrawerState(addDataId);
  const { openDrawer } = usePermanentDrawerState();
  const { executionId } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const { toolbarStyle } = useZoom();
  const dispatch = useDispatch();

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    toggleAddData();
    addAdditionalData({ parentId: stepId });
  };

  const handleAddWithCondition = (e) => {
    handleNoAction(e);
    if (!isEditing) return;
    const parentId = stepId;

    const id = generateUUIDWithoutHyphens();
    dispatch(addStep({ parentId, id, addCondition: true }));
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
