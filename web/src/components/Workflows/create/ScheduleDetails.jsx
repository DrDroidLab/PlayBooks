import React from "react";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { scheduleOptions } from "../../../utils/workflow/scheduleOptions.tsx";
import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender.jsx";
import { handleSelect } from "../utils/handleInputs.ts";
import TabsComponent from "../../common/TabsComponent/index.tsx";

function ScheduleDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div>
      <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        What happens when the workflow is triggered?
        <p className="text-gray-500 text-xs italic">Select one of these</p>
      </label>
      <div className="flex items-center mt-1 overflow-hidden w-fit">
        <TabsComponent
          options={scheduleOptions}
          handleSelect={handleSelect}
          selectedId={currentWorkflow.schedule}
          data-type="schedule"
        />
      </div>
      <div className="mt-2">
        {scheduleOptions
          .find((e) => e.id === currentWorkflow.schedule)
          ?.options.map((option) => (
            <HandleInputRender key={option.id} option={option} />
          ))}
      </div>
      {/* {(currentWorkflow["cron-schedule"] ||
        (currentWorkflow.interval && currentWorkflow.duration)) && (
        <p className="mt-4 text-xs p-1 bg-gray-50 rounded italic">{`This configuration means that this workflow will run ${
          currentWorkflow["cron-schedule"]
            ? `as per {${currentWorkflow["cron-schedule"]}} schedule`
            : ""
        } for the next ${currentWorkflow.duration} ${
          currentWorkflow.interval
        }`}</p>
      )} */}
    </div>
  );
}

export default ScheduleDetails;
