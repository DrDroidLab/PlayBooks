import React, { useEffect } from "react";
import { renderTimestamp } from "../../../utils/DateUtils";
import HandleOutput from "../steps/HandleOutput";
import useVisibility from "../../../hooks/useVisibility.ts";
import useScrollIntoView from "../../../hooks/useScrollIntoView.ts";
import usePlaybookKey from "../../../hooks/usePlaybookKey.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";

function StepConfig({ step, index, handleShowConfig }) {
  const [, setCurrentVisibleStep] = usePlaybookKey("currentVisibleStep");
  const { additionalData } = usePermanentDrawerState();
  const scrollRef = useScrollIntoView(index);
  const isVisible = useVisibility(scrollRef, 0.5);
  const [, setShouldScroll] = usePlaybookKey("shouldScroll");

  useEffect(() => {
    if (additionalData.showStepId === step?.id?.toString()) {
      setCurrentVisibleStep(index);
      setShouldScroll("default");
    }

    if (
      additionalData.showStepId !== undefined &&
      additionalData.showStepId !== null
    ) {
      return;
    }

    if (isVisible) {
      setCurrentVisibleStep(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, additionalData]);

  return (
    <div ref={scrollRef} className="border rounded p-1 bg-gray-100 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col px-1">
          <h2 className="text-violet-500 text-sm font-bold">Step</h2>
          <div className="flex gap-2 items-center flex-wrap">
            <h1 className="font-semibold text-lg line-clamp-3">
              {step.description}
            </h1>
            <div onClick={() => handleShowConfig(step.id)}>
              {/* (
              <span className="text-violet-500 cursor-pointer hover:underline">
                Config
              </span>
              ) */}
            </div>
          </div>
        </div>
        <div className="flex flex-col mr-2">
          <h2 className="text-violet-500 text-sm font-bold">Executed At</h2>
          <p className="text-gray-500 italic text-sm">
            {step?.outputs?.data?.length > 0
              ? renderTimestamp(step?.outputs?.data?.[0]?.timestamp)
              : ""}
          </p>
        </div>
      </div>
      <HandleOutput id={step.id} stepData={step} showHeading={false} />
    </div>
  );
}

export default StepConfig;
