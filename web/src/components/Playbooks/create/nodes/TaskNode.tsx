import React from "react";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import TaskTitle from "../../card/TaskTitle.tsx";
import handleTaskBorderColor from "../../../../utils/playbook/handleTaskBorderColor.ts";
import TaskInformation from "../../card/TaskInformation.tsx";
import {
  playbookSelector,
  setCurrentVisibleTask,
} from "../../../../store/features/playbook/playbookSlice.ts";
import { PermanentDrawerTypes } from "../../../../store/features/drawers/permanentDrawerTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import usePermanentDrawerState from "../../../../hooks/usePermanentDrawerState.ts";
import { useDraggable } from "@dnd-kit/core";

const taskDetailsId = PermanentDrawerTypes.TASK_DETAILS;

function TaskNode({ taskId }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: taskId,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  const [task] = useCurrentTask(taskId);
  const dispatch = useDispatch();
  const { toggle, openDrawer, permanentView, addAdditionalData } =
    usePermanentDrawerState();
  const { currentVisibleTask } = useSelector(playbookSelector);

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e) => {
    handleNoAction(e);
    if (permanentView === taskDetailsId && currentVisibleTask === taskId) {
      toggle(taskDetailsId);
      return;
    }
    addAdditionalData({});
    dispatch(setCurrentVisibleTask(taskId));
    openDrawer(taskDetailsId);
  };

  return (
    <>
      <div
        onClick={handleClick}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`${
          currentVisibleTask === taskId ? "border-violet-500 border-2" : ""
        } rounded-md overflow-hidden border-2 border-transparent`}
        style={{ borderColor: handleTaskBorderColor(taskId), ...style }}>
        <div className="">
          <TaskTitle taskId={task?.id} />
        </div>
        <div className="">
          <TaskInformation taskId={task?.id} />
        </div>
      </div>
    </>
  );
}

export default TaskNode;
