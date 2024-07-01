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
import useHasChildren from "../../../../hooks/useHasChildren.ts";
import useIsPrefetched from "../../../../hooks/useIsPrefetched.ts";
import CustomButton from "../../../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import { DrawerTypes } from "../../../../store/features/drawers/drawerTypes.ts";
import useDrawerState from "../../../../hooks/useDrawerState.ts";

const addDataId = DrawerTypes.ADD_DATA;

function StepNode({ data }) {
  const { toggle: toggleAddData, addAdditionalData } =
    useDrawerState(addDataId);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const { executionId } = useSelector(playbookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks;
  const step: Step = data.step;
  const isPrefetched = useIsPrefetched();
  const isEditing = !isPrefetched && !executionId;
  const hasChildren = useHasChildren(step?.id);

  const handleAddTask = () => {
    toggleAddData();
    addAdditionalData({ stepId: step?.id });
  };

  return (
    <div className="p-2 rounded bg-gray-100 border-2 min-w-[250px]">
      <p className="font-bold text-violet-500 text-base">{step.description}</p>
      <div className="flex flex-col gap-1 mt-2">
        {step.tasks.map((stepTask) => {
          const task = tasks?.find((task) => task.id === stepTask);
          return <TaskNode key={stepTask} taskId={task?.id} />;
        })}
      </div>
      <div className="mt-2">
        <CustomButton onClick={handleAddTask}>
          <Add fontSize="small" />
          <p>Add Task</p>
        </CustomButton>
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
          <AddButtonOptions stepId={step.id} />
        </NodeToolbar>
      )}
    </div>
  );
}

export default StepNode;
