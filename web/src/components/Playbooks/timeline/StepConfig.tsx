import React, { useEffect } from "react";
import { renderTimestamp } from "../../../utils/common/dateUtils.ts";
import useVisibility from "../../../hooks/common/useVisibility.ts";
import useScrollIntoView from "../../../hooks/playbooks/useScrollIntoView.ts";
import usePlaybookKey from "../../../hooks/playbooks/usePlaybookKey";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState";
import HandleOutput from "../task/HandleOutput.tsx";
import { Step, Task } from "../../../types/index.ts";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";
import MarkdownOutput from "../card/MarkdownOutput.tsx";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";

type StepConfigPropTypes = {
  step: Step;
  index: number;
};

function StepConfig({ step, index }: StepConfigPropTypes) {
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
      typeof taskId === "string" ? tasks.find((e) => e.id === taskId) : taskId,
    )
    .filter((task) => task !== undefined);

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
        <HandleOutput
          key={task.id}
          id={task?.id}
          showHeading={false}
          taskFromExecution={task}
        />
      ))}

      {step.notes && (
        <div className="flex flex-wrap flex-col mt-1">
          <h2 className="text-violet-500 text-sm font-bold">Notes</h2>
          <MarkdownOutput content={step.notes} />
        </div>
      )}

      {(step?.external_links?.length ?? 0) > 0 && (
        <div className="flex gap-1 flex-wrap flex-col mt-1">
          <h2 className="text-violet-500 text-sm font-bold">External Links</h2>
          <ExternalLinksList id={step.id} />
        </div>
      )}
    </div>
  );
}

export default StepConfig;
