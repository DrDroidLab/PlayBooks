import React from "react";
import { Step } from "../../../../types/index.ts";
import TaskNode from "./TaskNode.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
  setCurrentVisibleStep,
} from "../../../../store/features/playbook/playbookSlice.ts";
import { Handle, NodeToolbar, Position } from "reactflow";
import AddButtonOptions from "../../card/AddButtonOptions.tsx";
import useIsPrefetched from "../../../../hooks/useIsPrefetched.ts";
import StepTitle from "../../steps/StepTitle.tsx";
import StepButtons from "../../steps/StepButtons.tsx";
import useStepDimensions from "../../../../hooks/step/useStepDimensions.ts";
import usePermanentDrawerState from "../../../../hooks/usePermanentDrawerState.ts";
import { PermanentDrawerTypes } from "../../../../store/features/drawers/permanentDrawerTypes.ts";

const stepDetailsId = PermanentDrawerTypes.STEP_DETAILS;

function StepNode({ data }) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { executionId, currentVisibleStep } = useSelector(playbookSelector);
  const tasks = currentPlaybook?.ui_requirement?.tasks;
  const step: Step = data.step;
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const dispatch = useDispatch();
  // const hasChildren = useHasChildren(step?.id);
  const stepRef = useStepDimensions(step?.id);
  const { toggle, openDrawer, permanentView, addAdditionalData } =
    usePermanentDrawerState();

  const showStepDetails = () => {
    if (
      permanentView === stepDetailsId &&
      currentVisibleStep === stepDetailsId
    ) {
      toggle(stepDetailsId);
      return;
    }
    addAdditionalData({});
    dispatch(setCurrentVisibleStep(step.id));
    openDrawer(stepDetailsId);
  };

  return (
    <div
      ref={stepRef}
      onClick={showStepDetails}
      className="p-2 rounded bg-gray-100 border-2 min-w-[250px]">
      <StepTitle step={step} />
      <div className="flex flex-col gap-1 mt-2">
        {step?.tasks?.map((stepTask) => {
          const taskId = typeof stepTask === "string" ? stepTask : stepTask.id;
          const task = tasks?.find((task) => task.id === taskId);
          if (!task) return null;
          return <TaskNode key={taskId} taskId={taskId} />;
        })}
      </div>
      <StepButtons id={step.id} />

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !w-5 !h-5 absolute !top-0 !transform !-translate-x-1/2 !-translate-y-1/2 !border-violet-500 !border-2"
      />

      {/* {hasChildren && ( */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white !w-5 !h-5 absolute !bottom-0 !transform !-translate-x-1/2 !translate-y-1/2 !border-violet-500 !border-2"
      />
      {/* )} */}

      {isEditing && (
        <NodeToolbar isVisible={true} position={Position.Bottom}>
          <AddButtonOptions stepId={step.id} />
        </NodeToolbar>
      )}
    </div>
  );
}

export default StepNode;
