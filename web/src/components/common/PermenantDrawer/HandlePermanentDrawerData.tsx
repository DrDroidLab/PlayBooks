import React from "react";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import { useSelector } from "react-redux";
import { permanentViewSelector } from "../../../store/features/drawers/drawersSlice.ts";
import AddCondition from "../../AddCondition/index.tsx";
import Timeline from "../../Playbooks/Timeline.jsx";
import TaskDetailsDrawer from "../../Playbooks/create/TaskDetailsDrawer.tsx";
import StepDetailsDrawer from "../PermanentDrawers/StepDetailsDrawer.tsx";

function HandlePermanentDrawerData() {
  const permanentView = useSelector(permanentViewSelector);

  switch (permanentView) {
    case PermanentDrawerTypes.CONDITION:
      return <AddCondition />;
    case PermanentDrawerTypes.STEP_DETAILS:
      return <StepDetailsDrawer />;
    case PermanentDrawerTypes.TASK_DETAILS:
      return <TaskDetailsDrawer />;
    case PermanentDrawerTypes.TIMELINE:
      return <Timeline />;
    default:
      return <div>No View Selected</div>;
  }
}

export default HandlePermanentDrawerData;
