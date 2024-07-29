import { cardsData } from "../../../utils/common/cardsData.ts";
import TaskButtons from "./TaskButtons.tsx";
import HandleTaskIcon from "./HandleTaskIcon.tsx";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";

function TaskTitle({ taskId }) {
  const [task] = useCurrentTask(taskId);

  return (
    <div className="bg-gray-300 flex items-center justify-between p-2 w-full">
      <div className="flex items-center gap-1">
        {task?.source && (
          <img
            className="w-8 h-8"
            src={cardsData.find((e) => e.enum === task?.source)?.url ?? ""}
            alt="logo"
          />
        )}
        <HandleTaskIcon taskId={task?.id} />
        <p className="text-sm font-semibold break-word line-clamp-2">
          {task?.description}
        </p>
      </div>
      <TaskButtons taskId={task?.id} />
    </div>
  );
}

export default TaskTitle;
