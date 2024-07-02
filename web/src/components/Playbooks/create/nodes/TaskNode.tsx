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

const taskDetailsId = PermanentDrawerTypes.TASK_DETAILS;

function TaskNode({ taskId }) {
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
    <div
      onClick={handleClick}
      className={`rounded-md overflow-hidden border border-transparent`}
      style={{ borderColor: handleTaskBorderColor(taskId) }}>
      <div className="add-button">
        <TaskTitle taskId={task?.id} />
      </div>
      <div className="add-step-buttons transition-all">
        <TaskInformation taskId={task?.id} />
      </div>
    </div>
  );
}

export default TaskNode;
