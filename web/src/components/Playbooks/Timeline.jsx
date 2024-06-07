import React, { useEffect, useState } from "react";
import { useLazyGetPlaybookExecutionQuery } from "../../store/features/playbook/api/index.ts";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { executionToPlaybook } from "../../utils/parser/playbook/executionToPlaybook.ts";
import Loading from "../common/Loading/index.tsx";
import HandleOutput from "./steps/HandleOutput.jsx";
import { renderTimestamp } from "../../utils/DateUtils.js";

function Timeline() {
  const { executionId } = useSelector(playbookSelector);
  const [triggerGetPlaybookExeution, { isFetching }] =
    useLazyGetPlaybookExecutionQuery();
  const [steps, setSteps] = useState([]);

  const populateData = async () => {
    const data = await triggerGetPlaybookExeution(
      { playbookRunId: executionId },
      false,
    ).unwrap();
    const pbData = executionToPlaybook(data?.playbook_execution);
    setSteps(pbData);
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
            <h2 className="text-violet-500 text-sm font-bold">Step title</h2>
            <h1 className="font-semibold text-lg line-clamp-3 mb-2">
              {step.description}
            </h1>
            <h2 className="text-violet-500 text-sm font-bold">Executed At</h2>
            <p className="text-gray-500 italic text-sm">
              {step?.outputs?.data?.length > 0
                ? renderTimestamp(step?.outputs?.data?.[0]?.timestamp)
                : ""}
            </p>
            <HandleOutput index={index} stepData={step} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default Timeline;
