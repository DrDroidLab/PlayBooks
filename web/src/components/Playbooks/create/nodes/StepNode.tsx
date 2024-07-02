import React from "react";
import { Step } from "../../../../types/index.ts";
import TaskNode from "./TaskNode.tsx";
import { useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../../../../store/features/playbook/playbookSlice.ts";
import { Handle, NodeToolbar, Position } from "reactflow";
import AddButtonOptions from "../../card/AddButtonOptions.tsx";
// import useHasChildren from "../../../../hooks/useHasChildren.ts";
import useIsPrefetched from "../../../../hooks/useIsPrefetched.ts";
import StepTitle from "../../steps/StepTitle.tsx";
import StepButtons from "../../steps/StepButtons.tsx";
import useStepDimensions from "../../../../hooks/step/useStepDimensions.ts";

function StepNode({ data }) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { executionId } = useSelector(playbookSelector);
  const tasks = currentPlaybook?.ui_requirement?.tasks;
  const step: Step = data.step;
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  // const hasChildren = useHasChildren(step?.id);
  const stepRef = useStepDimensions(step?.id);

  return (
    <div
      ref={stepRef}
      className="p-2 rounded bg-gray-100 border-2 min-w-[250px]">
      <StepTitle step={step} />
      <div className="flex flex-col gap-1 mt-2">
        {step?.tasks.map((stepTask) => {
          const taskId = typeof stepTask === "string" ? stepTask : stepTask.id;
          const task = tasks?.find((task) => task.id === taskId);
          if (!task) return null;
          return <TaskNode key={stepTask?.id ?? stepTask} taskId={task?.id} />;
        })}
      </div>
      <StepButtons step={step} />

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
