/* eslint-disable react-hooks/exhaustive-deps */
import AddDataSourcesDrawer from "../../common/Drawers/AddDataSourcesDrawer.jsx";
import React from "react";
import AddSource from "./AddSource.tsx";
import TaskBlock from "./TaskBlock.tsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

function TaskQuery({ id }) {
  const [task] = useCurrentTask(id);

  return (
    <div>
      <div className="flex items-center gap-2">
        <AddSource id={id} />
      </div>

      {task?.source && <TaskBlock id={id} />}
      <AddDataSourcesDrawer />
    </div>
  );
}

export default TaskQuery;
