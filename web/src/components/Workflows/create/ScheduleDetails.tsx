import React from "react";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { scheduleOptions } from "../../../utils/workflow/scheduleOptions.tsx";
import { handleInput, handleSelect } from "../utils/handleInputs.ts";
import TabsComponent from "../../common/TabsComponent/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";

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
      <div className="flex flex-col gap-2 mt-2">
        {scheduleOptions
          .find((e) => e.id === currentWorkflow.schedule)
          ?.options.map((option) => {
            const disabled = option.disabledKey
              ? currentWorkflow[option.disabledKey]
              : false;
            return (
              <CustomInput
                type={option.type}
                handleChange={(val) =>
                  option.handleChange
                    ? option.handleChange(val)
                    : handleInput(option.id, val)
                }
                value={option.value ?? currentWorkflow[option.id] ?? ""}
                disabled={disabled}
                error={
                  currentWorkflow?.errors
                    ? currentWorkflow.errors[option.id]
                    : false
                }
                {...option}
              />
            );
          })}
      </div>
    </div>
  );
}

export default ScheduleDetails;
