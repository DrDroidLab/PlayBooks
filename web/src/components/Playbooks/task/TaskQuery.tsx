/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import AddDataSourcesDrawer from "../../common/Drawers/AddDataSourcesDrawer.jsx";
import React from "react";
import AddSource from "./AddSource.tsx";
import TaskBlock from "./TaskBlock.tsx";

function TaskQuery({ id }) {
  const [step] = useCurrentStep(id);

  return (
    <div>
      <div className="flex items-center gap-2">
        <AddSource id={id} />
      </div>

      {step?.source && <TaskBlock id={id} />}
      <AddDataSourcesDrawer />
    </div>
  );
}

export default TaskQuery;
