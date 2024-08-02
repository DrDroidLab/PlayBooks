import { useGetPlaybooksNoLimitQuery } from "../../../store/features/playbook/api/index.ts";
import { handleSelect } from "../utils/handleInputs.ts";
import { useSelector } from "react-redux";
import { RefreshRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import GlobalVariablesList from "./GlobalVariablesList.tsx";

function PlaybookDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const {
    data,
    isFetching: playbooksLoading,
    refetch,
  } = useGetPlaybooksNoLimitQuery();

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
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={data?.playbooks?.map((e) => {
          return {
            id: e.id,
            label: e.name,
            playbook: e,
          };
        })}
        placeholder={`Select Playbook`}
        handleChange={(id) => {
          const playbook = data?.playbooks.find((e) => e.id === id);
          handleSelect("playbookId", playbook);
        }}
        value={currentWorkflow?.playbookId}
        searchable={true}
        error={currentWorkflow?.errors?.playbookId ?? false}
        suffix={
          <>
            {playbooksLoading && <CircularProgress size={20} />}
            <button onClick={refetch}>
              <RefreshRounded
                className={`text-gray-400 hover:text-gray-600 transition-all`}
              />
            </button>
          </>
        }
      />

      {currentWorkflow?.playbookId && (
        <GlobalVariablesList
          global_variable_set={
            data?.playbooks.find((e) => e.id === currentWorkflow?.playbookId)
              ?.global_variable_set ?? {}
          }
        />
      )}
    </div>
  );
}

export default PlaybookDetails;
