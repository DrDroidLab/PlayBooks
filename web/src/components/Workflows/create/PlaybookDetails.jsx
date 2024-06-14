import React, { useState } from "react";
import SelectComponent from "../../SelectComponent";
import { useGetPlaybooksQuery } from "../../../store/features/playbook/api/index.ts";
import { handleInput, handleSelect } from "../utils/handleInputs.ts";
import { useSelector } from "react-redux";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import RadioGroup from "../../common/RadioGroupComponent/index.tsx";

const radioOptions = [
  {
    label: "Generate a link to execute this playbook",
    value: "default",
    isSmall: true,
  },
  {
    label: "Execute this playbook and publish its summary",
    value: "summary",
    isSmall: true,
  },
];

function PlaybookDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const {
    data,
    isFetching: playbooksLoading,
    refetch,
  } = useGetPlaybooksQuery({});
  const [selectedValue, setSelectedValue] = useState("default");

  const handleRadioChange = (value) => {
    setSelectedValue(value);
    if (value === "summary") {
      handleInput("generateSummary", true);
    } else {
      handleInput("generateSummary", false);
    }
  };

  return (
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
          error={currentWorkflow?.errors?.playbookId ?? false}
        />
        {playbooksLoading && <CircularProgress size={20} />}
        <button onClick={refetch}>
          <RefreshRounded
            className={`text-gray-400 hover:text-gray-600 transition-all`}
          />
        </button>
      </div>

      <div className="mt-2">
        <RadioGroup
          options={radioOptions}
          onChange={handleRadioChange}
          orientation="vertical"
          checked={selectedValue}
        />
      </div>

      {/* <WorkflowGlobalVariables /> */}
    </div>
  );
}

export default PlaybookDetails;
