import React from "react";
import { executeStep } from "../../../utils/execution/executeStep.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";
import { Task } from "../../../types/index.ts";

function ExecuteNextStep({ stepId, refetch }) {
  const [step, id] = useCurrentStep(stepId);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const nextStepTasks: Task[] =
    step?.tasks
      ?.map((taskId) =>
        typeof taskId === "string"
          ? tasks.find((t) => t.id === taskId)
          : taskId,
      )
      .filter((t) => t !== undefined) ?? [];

  const handleExecuteNextStep = async () => {
    await executeStep(id);
    refetch();
  };

  if (Object.keys(step ?? {})?.length === 0) return <></>;

  return (
    <div className="border rounded p-3 bg-gray-100 mt-2">
      <h2 className="text-violet-500 text-sm font-bold">Next Step</h2>
      <div className="flex gap-2 items-center flex-wrap">
        <h1 className="font-semibold text-lg line-clamp-3">
          {step?.description}
        </h1>
      </div>
      <div className="flex flex-col">
        {nextStepTasks?.map((t) => (
          <p className="text-xs font-medium">- {t.description}</p>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <CustomButton onClick={handleExecuteNextStep}>
          <PlayArrowRounded /> Execute
        </CustomButton>
      </div>
    </div>
  );
}

export default ExecuteNextStep;
