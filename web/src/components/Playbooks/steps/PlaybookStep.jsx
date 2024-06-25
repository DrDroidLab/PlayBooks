import TaskDetails from "./TaskDetails.jsx";
import { useEffect, useState } from "react";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { fetchData } from "../../../utils/fetchAssetModelOptions.ts";
import HandleOutput from "./HandleOutput.jsx";

const PlaybookStep = ({ id }) => {
  const [step, currentStepId] = useCurrentStep(id);
  const showOutput = step.showOutput;
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
      step?.source &&
      step?.modelType &&
      step.connectorType
    ) {
      fetchData({ index: currentStepId });
    }
  }, [currentStepId, step?.source, step?.modelType, step?.connectorType]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {showOutput && (
        <button
          onClick={toggleConfig}
          className="border border-violet-500 text-violet-500 rounded p-1 hover:bg-violet-500 hover:text-white transition-all text-xs w-fit">
          {showConfig ? "Hide" : "Show"} Config
        </button>
      )}
      {showConfig && step && <TaskDetails id={id} />}

      <HandleOutput id={id} />
    </div>
  );
};

export default PlaybookStep;
