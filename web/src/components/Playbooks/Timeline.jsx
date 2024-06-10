import React, { useEffect, useState } from "react";
import { useLazyGetPlaybookExecutionQuery } from "../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  showStepConfig,
  stepsSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { executionToPlaybook } from "../../utils/parser/playbook/executionToPlaybook.ts";
import Loading from "../common/Loading/index.tsx";
import HandleOutput from "./steps/HandleOutput.jsx";
import { renderTimestamp } from "../../utils/DateUtils.js";
import CustomButton from "../common/CustomButton/index.tsx";
import { PlayArrowRounded } from "@mui/icons-material";
import { executeStep } from "../../utils/execution/executeStep.ts";

function Timeline({ setTimelineOpen }) {
  const { executionId } = useSelector(playbookSelector);
  const playbookSteps = useSelector(stepsSelector);
  const [triggerGetPlaybookExeution, { isFetching }] =
    useLazyGetPlaybookExecutionQuery();
  const [steps, setSteps] = useState([]);
  const dispatch = useDispatch();

  const lastStep = (playbookSteps ?? []).findIndex(
    (step) => step.id === steps[steps.length - 1]?.id,
  );

  const showNextStepExecution = lastStep < playbookSteps.length - 1;

  const populateData = async () => {
    const data = await triggerGetPlaybookExeution(
      { playbookRunId: executionId },
      false,
    ).unwrap();
    const pbData = executionToPlaybook(data?.playbook_execution);
    setSteps(pbData);
  };

  const handleShowConfig = (stepId) => {
    const index = playbookSteps.findIndex((step) => step.id === stepId);
    dispatch(showStepConfig(index));
    setTimelineOpen(false);
  };

  const handleExecuteNextStep = () => {
    executeStep(playbookSteps[lastStep + 1], lastStep + 1);
    setTimelineOpen(false);
  };

  useEffect(() => {
    if (executionId) populateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId]);

  if (isFetching) {
    return <Loading title="Your timeline is loading..." />;
  }

  return (
    <main className="p-2 min-h-screen mb-16">
      <div className="border-b p-2 sticky top-0 mb-2 bg-white z-10">
        <h1 className="font-bold text-xl">Timeline</h1>
      </div>

      {steps?.length === 0 && <p>No steps executed in the playbook yet</p>}

      <div className="flex flex-col gap-14 overflow-scroll">
        {steps?.map((step, index) => (
          <div key={index} className="border rounded p-3 bg-gray-100">
            <h2 className="text-violet-500 text-sm font-bold">Step</h2>
            <div className="flex gap-2 items-center flex-wrap">
              <h1 className="font-semibold text-lg line-clamp-3">
                {step.description}
              </h1>
              <div onClick={() => handleShowConfig(step.id)}>
                (
                <span className="text-violet-500 cursor-pointer hover:underline">
                  Show Config
                </span>
                )
              </div>
            </div>
            <h2 className="text-violet-500 text-sm font-bold mt-2">
              Executed At
            </h2>
            <p className="text-gray-500 italic text-sm">
              {step?.outputs?.data?.length > 0
                ? renderTimestamp(step?.outputs?.data?.[0]?.timestamp)
                : ""}
            </p>
            <HandleOutput index={index} stepData={step} />
          </div>
        ))}
      </div>

      {showNextStepExecution && (
        <div className="my-3">
          <CustomButton onClick={handleExecuteNextStep}>
            <PlayArrowRounded /> Execute Next Step
          </CustomButton>
        </div>
      )}
    </main>
  );
}

export default Timeline;
