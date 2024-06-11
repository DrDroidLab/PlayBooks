import React from "react";
import SelectComponent from "../../SelectComponent";
import { useGetPlaybooksQuery } from "../../../store/features/playbook/api/index.ts";
import { handleInput, handleSelect } from "../utils/handleInputs.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import Checkbox from "../../common/Checkbox/index.tsx";
import GlobalVariables from "../../common/GlobalVariable/index.jsx";

function PlaybookDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const {
    data,
    isFetching: playbooksLoading,
    refetch,
  } = useGetPlaybooksQuery({});

  const handleToggleSummary = () => {
    handleInput("generateSummary", !currentWorkflow?.summary ?? false);
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
        <Checkbox
          id="generateSummary"
          isChecked={currentWorkflow?.generateSummary}
          label="Generate Summary"
          info="Execute playbook and generate a summary on every workflow execution"
          onChange={handleToggleSummary}
          isSmall={true}
        />
      </div>

      {/* <GlobalVariables /> */}
    </div>
  );
}

export default PlaybookDetails;
