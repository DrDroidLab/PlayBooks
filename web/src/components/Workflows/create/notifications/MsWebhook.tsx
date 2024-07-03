import React from "react";
import SelectComponent from "../../../SelectComponent";
import { CircularProgress } from "@mui/material";
import { handleInput } from "../../utils/handleInputs.ts";
import { useGetMSTeamsWebhookOptionsQuery } from "../../../../store/features/triggers/api/getMSTeamsWebhookOptionsApi.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import AddNewIntegration from "./AddNewIntegration.tsx";

function MsWebhook() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const {
    data,
    isFetching: msTeamsOptionsFetching,
    refetch,
  } = useGetMSTeamsWebhookOptionsQuery();

  return (
    <div className="flex items-center gap-2 mt-2">
      <p className="text-xs font-bold text-gray-500">Select Webhook</p>
      {msTeamsOptionsFetching && <CircularProgress size={20} />}
      <SelectComponent
        data={data?.map((e) => {
          return {
            id: e.keyId,
            label: e.name,
          };
        })}
        placeholder="Select Webhook"
        onSelectionChange={(_, val) => {
          handleInput("ms_webhook", val.id);
        }}
        selected={currentWorkflow?.ms_webhook ?? ""}
        error={currentWorkflow?.errors?.ms_webhook ?? false}
        searchable={true}
      />

      <AddNewIntegration refetch={refetch} data={data} />
    </div>
  );
}

export default MsWebhook;
