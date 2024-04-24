import React from "react";
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

function SlackTriggerForm() {
  const { data: options } = useGetTriggerOptionsQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [
    triggerSearchTrigger,
    { data: searchTriggerResult, isFetching: searchLoading },
  ] = useLazyGetSearchTriggersQuery();

  const handleSubmit = (e) => {
    e?.preventDefault();
    triggerSearchTrigger({
      workspaceId: currentWorkflow?.trigger?.workspaceId,
      channel_id: currentWorkflow?.trigger?.channel_id,
      alert_type: currentWorkflow?.trigger?.alert_type,
      filter_string: currentWorkflow?.trigger?.filterString,
    });
  };

  const sources = options?.alert_types?.filter(
    (e) => e.channel_connector_key_id === currentWorkflow.channel?.id,
  );
  const data = searchTriggerResult?.alerts ?? null;

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
          onSelectionChange={(_, val) =>
            handleTriggerSelect("channel", val.channel)
          }
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
          onSelectionChange={(_, val) =>
            handleTriggerSelect("source", val.source)
          }
          selected={currentWorkflow?.trigger?.source?.alert_type ?? ""}
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

      <button className="text-xs bg-transparent hover:bg-violet-500 p-1 border-violet-500 border hover:text-white text-violet-500 rounded transition-all">
        Search
      </button>
      {searchLoading ? (
        <CircularProgress size={20} style={{ marginLeft: "10px" }} />
      ) : data ? (
        <AlertsTable data={data} />
      ) : (
        <></>
      )}
    </form>
  );
}

export default SlackTriggerForm;
