import { CircularProgress } from "@mui/material";
import React from "react";
import { handleInput } from "../../utils/handleInputs.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import { useGetTriggerOptionsQuery } from "../../../../store/features/triggers/api/getTriggerOptionsApi.ts";
import AddNewIntegration from "./AddNewIntegration.tsx";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";

function SlackMessage() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const { data: options, isFetching, refetch } = useGetTriggerOptionsQuery();
  const data = options?.active_channels;
  const channelOptions = data?.map((e) => {
    return {
      id: e.channel_id,
      label: e.channel_name,
      channel: e,
    };
  });

  return (
    <div className="flex items-center gap-2 mt-2">
      {isFetching && <CircularProgress size={20} />}
      <CustomInput
        label="Select Channel"
        type={InputTypes.DROPDOWN}
        options={channelOptions}
        placeholder="Select Channel"
        handleChange={(id) => {
          const val = channelOptions.find((d) => d.id === id);
          handleInput("channel", val.channel);
        }}
        value={
          currentWorkflow?.channel?.channel_id ||
          currentWorkflow?.trigger?.channel?.channel_id ||
          ""
        }
        error={currentWorkflow?.errors?.channel ?? false}
        searchable={true}
        suffix={<AddNewIntegration refetch={refetch} data={data} />}
      />
    </div>
  );
}

export default SlackMessage;
