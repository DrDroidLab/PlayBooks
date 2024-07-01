import React from "react";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import TaskTitle from "../../card/TaskTitle.tsx";
import handleTaskBorderColor from "../../../../utils/playbook/handleTaskBorderColor.ts";
import TaskInformation from "../../card/TaskInformation.tsx";
import { setCurrentVisibleTask } from "../../../../store/features/playbook/playbookSlice.ts";
import { PermanentDrawerTypes } from "../../../../store/features/drawers/permanentDrawerTypes.ts";
import { useDispatch } from "react-redux";
import usePermanentDrawerState from "../../../../hooks/usePermanentDrawerState.ts";

const taskDetailsId = PermanentDrawerTypes.TASK_DETAILS;

function TaskNode({ taskId }) {
  const [task] = useCurrentTask(taskId);
  const dispatch = useDispatch();
  const { toggle, openDrawer, permanentView, addAdditionalData } =
    usePermanentDrawerState();

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e) => {
    handleNoAction(e);
    if (permanentView === taskDetailsId) {
      toggle(taskDetailsId);
      return;
    }
    dispatch(setCurrentVisibleTask(taskId));
    addAdditionalData({});
    openDrawer(taskDetailsId);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-md overflow-hidden border border-transparent`}
      style={{ borderColor: handleTaskBorderColor(taskId) }}>
      <TaskTitle taskId={task?.id} />
      <TaskInformation taskId={task?.id} />
    </div>
  );
}

export default TaskNode;
