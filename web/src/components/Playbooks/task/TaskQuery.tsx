/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import AddDataSourcesDrawer from "../../common/Drawers/AddDataSourcesDrawer.jsx";
import AddSource from "./AddSource.tsx";
import TaskBlock from "./TaskBlock.tsx";

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
