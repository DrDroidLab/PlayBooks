import React from "react";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { handleSelect } from "../../../utils/workflow/handleInputs.ts";
import { scheduleOptions } from "../../../utils/workflow/scheduleOptions.tsx";
import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender.jsx";

function ScheduleDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div>
      <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        What happens when the workflow is triggered?
        <p className="text-gray-500 text-xs italic">Select one of these</p>
      </label>
      <div className="flex items-center mt-2 overflow-hidden w-fit">
        {scheduleOptions.map((option) => (
          <button
            key={option.id}
            data-type="schedule"
            onClick={(e) => handleSelect(e, option)}
            className={`${
              currentWorkflow.schedule === option.id
                ? "!bg-white !text-violet-500 border-violet-500"
                : "text-gray-500 bg-gray-50 border-gray-200"
            } p-2 text-sm hover:bg-gray-100 cursor-pointer transition-all rounded border`}>
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {scheduleOptions
          .find((e) => e.id === currentWorkflow.schedule)
          ?.options.map((option) => (
            <HandleInputRender option={option} />
          ))}
      </div>
      {(currentWorkflow["cron-schedule"] ||
        (currentWorkflow.interval && currentWorkflow.duration)) && (
        <p className="mt-4 text-xs p-1 bg-gray-50 rounded italic">{`This configuration means that this workflow will run ${
          currentWorkflow["cron-schedule"]
            ? `as per {${currentWorkflow["cron-schedule"]}} schedule`
            : ""
        } for the next ${currentWorkflow.duration} ${
          currentWorkflow.interval
        }`}</p>
      )}
    </div>
  );
}

export default ScheduleDetails;
