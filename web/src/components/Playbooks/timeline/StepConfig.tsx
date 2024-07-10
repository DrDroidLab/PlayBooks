import React, { useEffect, MouseEvent } from "react";
import { renderTimestamp } from "../../../utils/DateUtils.js";
import useVisibility from "../../../hooks/useVisibility.ts";
import useScrollIntoView from "../../../hooks/useScrollIntoView.ts";
import usePlaybookKey from "../../../hooks/usePlaybookKey.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import HandleOutput from "../task/HandleOutput.tsx";
import { Step, Task } from "../../../types/index.ts";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";

type StepConfigPropTypes = {
  step: Step;
  index: number;
  handleShowConfig: Function;
};

function StepConfig({ step, index, handleShowConfig }: StepConfigPropTypes) {
  const [, setCurrentVisibleStep] = usePlaybookKey(
    "currentVisibleStepOnTimeline",
  );
  const { additionalData } = usePermanentDrawerState();
  const scrollRef = useScrollIntoView(index);
  const isVisible = useVisibility(scrollRef, 0.5);
  const [, setShouldScroll] = usePlaybookKey("shouldScroll");
  const playbook = useSelector(currentPlaybookSelector);
  const tasks = playbook?.ui_requirement.tasks ?? [];
  const stepTasks: Task[] = step.tasks
    ?.map((taskId: string | Task) =>
      tasks.find(
        (e) => e.id === (typeof taskId === "string" ? taskId : taskId.id),
      ),
    )
    .filter((task) => task !== undefined);

  const handleNoAction = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

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

  if (stepTasks?.length === 0) return;

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
            {stepTasks?.[0]?.ui_requirement?.output?.data?.timestamp &&
              renderTimestamp(
                stepTasks?.[0]?.ui_requirement?.output?.data?.timestamp,
              )}
          </p>
        </div>
      </div>
      {stepTasks?.map((task: Task) => (
        <HandleOutput key={task.id} id={task?.id} showHeading={false} />
      ))}

      {step.notes && (
        <div className="flex flex-wrap flex-col mt-1">
          <h2 className="text-violet-500 text-sm font-bold">Notes</h2>
          <p className="line-clamp-2 text-xs">{step.notes}</p>
        </div>
      )}

      {(step?.external_links?.length ?? 0) > 0 && (
        <div className="flex gap-1 flex-wrap flex-col mt-1">
          <h2 className="text-violet-500 text-sm font-bold">External Links</h2>
          <div className="flex gap-1 flex-wrap flex-row">
            {step.external_links?.map((link) => (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-1 text-xs text-violet-500 underline"
                onClick={handleNoAction}>
                {link.name || link.url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StepConfig;
