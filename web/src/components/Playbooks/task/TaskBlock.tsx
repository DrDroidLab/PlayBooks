import { useEffect } from "react";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";
import Details from "./Details.tsx";
import HandleOutput from "./HandleOutput.tsx";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import TaskConfiguration from "./taskConfiguration";

const TaskBlock = ({ id }) => {
  const [task, currentStepId] = useCurrentTask(id);
  const showOutput = task?.ui_requirement?.showOutput;
  const isPrefetched = useIsPrefetched();

  useEffect(() => {
    if (
      currentStepId !== null &&
      task?.source &&
      task.ui_requirement?.model_type &&
      task?.task_connector_sources?.length > 0 &&
      !isPrefetched
    ) {
      fetchData({ index: currentStepId });
    }
  }, [
    currentStepId,
    task?.source,
    task?.ui_requirement.model_type,
    task?.task_connector_sources,
    isPrefetched,
  ]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {task && <Details id={id} />}

      <TaskConfiguration id={id} />
      <HandleOutput id={id} />
    </div>
  );
};

export default TaskBlock;
