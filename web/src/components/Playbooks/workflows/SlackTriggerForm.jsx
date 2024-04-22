import React from "react";
import SelectComponent from "../../SelectComponent";
import ValueComponent from "../../ValueComponent";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useGetTriggerOptionsQuery } from "../../../store/features/triggers/api/getTriggerOptionsApi.ts";

function SlackTriggerForm({ handleSelect, handleInput }) {
  const { data: options } = useGetTriggerOptionsQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 items-start bg-gray-50 rounded p-2">
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Channel</p>
        <SelectComponent
          data={options?.active_channels?.map((e) => {
            return {
              id: e.channel_id,
              label: e.channel_name,
              channel: e,
            };
          })}
          placeholder="Select Channel"
          onSelectionChange={handleSelect}
          selected={currentWorkflow?.channel_id ?? ""}
          searchable={true}
        />
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Source</p>
        <SelectComponent
          data={[].map((e) => {
            return {
              id: e.alert_type,
              label: e.alert_type,
              source: e,
            };
          })}
          placeholder="Select Source"
          onSelectionChange={handleSelect}
          selected={currentWorkflow?.alert_type ?? ""}
          searchable={true}
        />
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Filter</p>
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val) => {
            handleInput("filterString", val);
          }}
          value={currentWorkflow.filterString}
          placeHolder={"Enter filter string"}
          length={300}
        />
      </div>

      <button className="text-xs bg-transparent hover:bg-violet-500 p-1 border-violet-500 border hover:text-white text-violet-500 rounded transition-all">
        Search
      </button>
    </form>
  );
}

export default SlackTriggerForm;
