import { useEffect, useState } from "react";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import Details from "./Details.tsx";
import HandleOutput from "./HandleOutput.tsx";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import TaskConfiguration from "./taskConfiguration";

const TaskBlock = ({ id }) => {
  const [task, currentStepId] = useCurrentTask(id);
  const showOutput = task?.ui_requirement?.showOutput;
  const [showConfig, setShowConfig] = useState(!showOutput);
  const isPrefetched = useIsPrefetched();

  const toggleConfig = () => {
    setShowConfig(!showConfig);
  };

  useEffect(() => {
    setShowConfig(!showOutput);
  }, [showOutput]);

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
      {showOutput && (
        <CustomButton className="w-fit" onClick={toggleConfig}>
          {showConfig ? "Hide" : "Show"} Config
        </CustomButton>
      )}
      {showConfig && task && <Details id={id} />}

      <TaskConfiguration id={id} />
      <HandleOutput id={id} />
    </div>
  );
};

export default TaskBlock;
