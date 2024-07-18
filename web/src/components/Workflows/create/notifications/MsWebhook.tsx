import React from "react";
import { CircularProgress } from "@mui/material";
import { handleInput } from "../../utils/handleInputs.ts";
import { useGetMSTeamsWebhookOptionsQuery } from "../../../../store/features/triggers/api/getMSTeamsWebhookOptionsApi.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import AddNewIntegration from "./AddNewIntegration.tsx";
import CustomInput from "../../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import { LabelPosition } from "../../../../types/inputs/labelPosition.ts";

function MsWebhook() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const {
    data,
    isFetching: msTeamsOptionsFetching,
    refetch,
  } = useGetMSTeamsWebhookOptionsQuery();

  return (
    <div className="flex items-center gap-2 mt-2">
      {msTeamsOptionsFetching && <CircularProgress size={20} />}
      <CustomInput
        label="Webhook"
        labelPosition={LabelPosition.LEFT}
        type={InputTypes.DROPDOWN}
        options={data?.map((e) => {
          return {
            id: e.keyId,
            label: e.name,
          };
        })}
        placeholder="Select Webhook"
        handleChange={(id) => {
          handleInput("ms_webhook", id);
        }}
        value={currentWorkflow?.ms_webhook ?? ""}
        error={currentWorkflow?.errors?.ms_webhook ?? false}
        searchable={true}
        suffix={<AddNewIntegration refetch={refetch} data={data} />}
      />
    </div>
  );
}

export default MsWebhook;
