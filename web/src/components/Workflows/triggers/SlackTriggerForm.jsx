import React, { useState } from "react";
import SelectComponent from "../../SelectComponent/index.jsx";
import ValueComponent from "../../ValueComponent/index.jsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useGetTriggerOptionsQuery } from "../../../store/features/triggers/api/getTriggerOptionsApi.ts";
import {
  handleTriggerInput,
  handleTriggerSelect,
} from "../utils/handleInputs.ts";
import AlertsTable from "./AlertsTable.jsx";
import { CircularProgress } from "@mui/material";
import { useLazyGetSearchTriggersQuery } from "../../../store/features/triggers/api/searchTriggerApi.ts";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";

function SlackTriggerForm() {
  const { data: options } = useGetTriggerOptionsQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [
    triggerSearchTrigger,
    { data: searchTriggerResult, isFetching: searchLoading },
  ] = useLazyGetSearchTriggersQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSubmit = () => {
    triggerSearchTrigger({
      workspaceId: currentWorkflow?.trigger?.workspaceId,
      channel_id: currentWorkflow?.trigger?.channel?.channel_id,
      alert_type: currentWorkflow?.trigger?.source,
      filter_string: currentWorkflow?.trigger?.filterString,
    });
    setIsDrawerOpen(true);
  };
  const sources = options?.alert_types?.filter(
    (e) => e.channel_id === currentWorkflow.trigger.channel?.channel_id,
  );
  const data = searchTriggerResult?.alerts ?? [];

  return (
    <div className="flex flex-col gap-2 items-start bg-gray-50 rounded p-2">
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
          onSelectionChange={(_, val) => {
            handleTriggerSelect("channel", val.channel);
          }}
          selected={currentWorkflow?.trigger?.channel?.channel_id ?? ""}
          searchable={true}
        />
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Source</p>
        <SelectComponent
          data={sources?.map((e) => {
            return {
              id: e.alert_type,
              label: e.alert_type,
              source: e,
            };
          })}
          placeholder="Select Source"
          onSelectionChange={(id) => handleTriggerSelect("source", id)}
          selected={currentWorkflow?.trigger?.source ?? ""}
          searchable={true}
        />
      </div>
      <div className="text-sm flex items-center gap-2">
        <p className="text-xs">Filter</p>
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val) => {
            handleTriggerInput("filterString", val);
          }}
          value={currentWorkflow?.trigger?.filterString}
          placeHolder={"Enter filter string"}
          length={300}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="text-xs bg-transparent hover:bg-violet-500 p-1 border-violet-500 border hover:text-white text-violet-500 rounded transition-all">
        Search
      </button>
      <CustomDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
        {searchLoading ? (
          <CircularProgress size={20} style={{ marginLeft: "10px" }} />
        ) : data ? (
          <div className="bg-gray-100 p-2">
            <AlertsTable data={data} />
          </div>
        ) : (
          <></>
        )}
      </CustomDrawer>
    </div>
  );
}

export default SlackTriggerForm;
