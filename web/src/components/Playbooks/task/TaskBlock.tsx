import { useEffect, useState } from "react";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";
import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import Details from "./Details.tsx";
import HandleOutput from "../steps/HandleOutput.jsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

const TaskBlock = ({ id }) => {
  const [task, currentStepId] = useCurrentTask(id);
  const showOutput = task?.ui_requirement?.showOutput;
  const [showConfig, setShowConfig] = useState(!showOutput);

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
      task?.task_connector_sources?.length > 0
    ) {
      fetchData({ index: currentStepId });
    }
  }, [
    currentStepId,
    task?.source,
    task?.ui_requirement.model_type,
    task?.task_connector_sources,
  ]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {showOutput && (
        <CustomButton onClick={toggleConfig}>
          {showConfig ? "Hide" : "Show"} Config
        </CustomButton>
      )}
      {showConfig && task && <Details id={id} />}

      <HandleOutput id={id} />
    </div>
  );
};

export default TaskBlock;
