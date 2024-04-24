import React from "react";
import ValueComponent from "../../ValueComponent";
import SelectComponent from "../../SelectComponent";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useGetPlaybooksQuery } from "../../../store/features/playbook/api/index.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import SlackTriggerForm from "./triggers/SlackTriggerForm.jsx";
import { triggerTypes } from "../../../utils/workflow/triggerTypes.ts";
import { handleInput, handleSelect } from "./utils/handleInputs.ts";

function BasicDetails() {
  const {
    data,
    isFetching: playbooksLoading,
    refetch,
  } = useGetPlaybooksQuery({});
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <>
      <div className="flex gap-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            Workflow Name
          </label>
          <ValueComponent
            valueType={"STRING"}
            placeHolder={"Enter workflow name"}
            value={currentWorkflow.name}
            onValueChange={(val) => handleInput("name", val)}
          />
        </div>
        <div className="space-y-2">
          <label
            className="flex gap-2 items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            Select Playbook
            <a
              href="/playbooks/create"
              rel="noreferrer"
              target="_blank"
              className="border border-violet-500 p-1 rounded text-violet-500 hover:bg-violet-500 hover:text-white transition-all text-xs">
              + Create New
            </a>
          </label>
          <div className="flex gap-2 items-center">
            <SelectComponent
              data={data?.playbooks?.map((e) => {
                return {
                  id: e.id,
                  label: e.name,
                  playbook: e,
                };
              })}
              placeholder={`Select Playbook`}
              onSelectionChange={(_, val) => {
                handleSelect("playbookId", val);
              }}
              selected={currentWorkflow?.playbookId}
              searchable={true}
            />
            {playbooksLoading && <CircularProgress size={20} />}
            <button onClick={refetch}>
              <RefreshRounded
                className={`text-gray-400 hover:text-gray-600 transition-all`}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label
            className="flex gap-2 items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            Trigger Type
          </label>
          <div className="flex gap-2 items-center">
            <SelectComponent
              data={triggerTypes?.map((e) => {
                return {
                  id: e.id,
                  label: e.label,
                };
              })}
              placeholder={`Select Workflow Type`}
              onSelectionChange={(_, val) => {
                handleSelect("workflowType", val);
              }}
              selected={currentWorkflow?.workflowType}
              searchable={true}
            />
          </div>
        </div>
        {currentWorkflow.workflowType === "slack" && (
          <SlackTriggerForm
            handleInput={handleInput}
            handleSelect={handleSelect}
          />
        )}
      </div>
    </>
  );
}

export default BasicDetails;
