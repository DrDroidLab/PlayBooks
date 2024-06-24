import React from "react";
import { Handle, NodeToolbar, Position } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setCurrentStepId,
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
import handleStepInformation from "../../../utils/playbook/stepInformation/handleStepInformation.ts";
import InfoRender from "../card/InfoRender.tsx";

const addDataId = DrawerTypes.ADD_DATA;

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
    if (
      permanentView === PermanentDrawerTypes.STEP_DETAILS &&
      currentStepId === step.id
    ) {
      togglePermanentDrawer(PermanentDrawerTypes.STEP_DETAILS);
      return;
    }
    dispatch(setCurrentStepId(step.id));
    addAdditionalData({});
    openDrawer(PermanentDrawerTypes.STEP_DETAILS);
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
      <div
        className={`${
          currentStepId === step.id.toString() ? "shadow-violet-500" : ""
        } px-4 py-2 bg-white border-2 border-stone-400 w-[300px] h-auto cursor-pointer transition-all hover:shadow-violet-500 flex flex-col gap-2`}>
        {handleStepInformation(step.id).map((info, i) => (
          <div className="flex flex-col">
            <p className="text-xs font-semibold">{info.label}</p>
            <InfoRender info={info} stepId={step.id} key={i} />
          </div>
        ))}
      </div>

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
          <AddButtonOptions />
        </NodeToolbar>
      )}
    </div>
  );
}
