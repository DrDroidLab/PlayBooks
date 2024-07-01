import React from "react";
import { Handle, NodeToolbar, Position } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setCurrentVisibleTask,
} from "../../../store/features/playbook/playbookSlice.ts";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useHasChildren from "../../../hooks/useHasChildren.ts";
import handleStepBorderColor from "../../../utils/playbook/handleStepBorderColor.ts";
import StepTitle from "../card/StepTitle.tsx";
import AddButtonOptions from "../card/AddButtonOptions.tsx";
import StepInformation from "../card/StepInformation.tsx";

const addDataId = DrawerTypes.ADD_DATA;
const stepDetailsId = PermanentDrawerTypes.STEP_DETAILS;

export default function CustomNode({ data }) {
  const { addAdditionalData } = useDrawerState(addDataId);
  const {
    toggle: togglePermanentDrawer,
    openDrawer,
    permanentView,
  } = usePermanentDrawerState();
  const dispatch = useDispatch();
  const { currentStepId, executionId } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const step = data.step;
  const hasChildren = useHasChildren(step?.id);

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e, config = true) => {
    handleNoAction(e);
    if (isPrefetched && !config) {
      addAdditionalData({ showStepId: step.id });
      openDrawer(PermanentDrawerTypes.TIMELINE);
      return;
    }
    if (permanentView === stepDetailsId && currentStepId === step.id) {
      togglePermanentDrawer(stepDetailsId);
      return;
    }
    dispatch(setCurrentVisibleTask(step.id));
    addAdditionalData({});
    openDrawer(stepDetailsId);
  };

  return (
    <div
      onClick={(e) => handleClick(e, false)}
      className={`${
        currentStepId === step.id.toString()
          ? "shadow-md shadow-violet-500"
          : ""
      } rounded-md overflow-hidden border border-transparent`}
      style={{ borderColor: handleStepBorderColor(step.id) }}>
      <StepTitle stepId={step.id} handleClick={handleClick} />

      <StepInformation stepId={step.id} />

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !w-5 !h-5 absolute !top-0 !transform !-translate-x-1/2 !-translate-y-1/2 !border-violet-500 !border-2"
      />

      {hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-white !w-5 !h-5 absolute !bottom-0 !transform !-translate-x-1/2 !translate-y-1/2 !border-violet-500 !border-2"
        />
      )}

      {isEditing && (
        <NodeToolbar isVisible={true} position={Position.Bottom}>
          <AddButtonOptions stepId={step.id} />
        </NodeToolbar>
      )}
    </div>
  );
}
