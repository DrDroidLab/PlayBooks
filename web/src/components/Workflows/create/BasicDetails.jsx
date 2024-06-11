/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import ValueComponent from "../../ValueComponent/index.jsx";
import SelectComponent from "../../SelectComponent/index.jsx";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import { triggerOptions } from "../../../utils/workflow/triggerOptions.ts";
import { handleInput, handleSelect } from "../utils/handleInputs.ts";
import HandleWorkflowType from "./utils/HandleWorkflowType.tsx";
import { useGenerateCurlMutation } from "../../../store/features/workflow/api/generateCurlApi.ts";
import PlaybookDetails from "./PlaybookDetails.jsx";

function BasicDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [triggerGenerateCurl, { isLoading: generateCurlLoading }] =
    useGenerateCurlMutation();
  const dispatch = useDispatch();

  const handleGenerateCurl = async () => {
    if (!currentWorkflow.name) {
      dispatch(
        setCurrentWorkflowKey({
          key: "curl",
          value: undefined,
        }),
      );
    }
    await triggerGenerateCurl(currentWorkflow.name);
  };

  useEffect(() => {
    if (currentWorkflow?.workflowType === "api") {
      handleGenerateCurl();
    }
  }, [currentWorkflow.name, currentWorkflow?.workflowType]);

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
            onValueChange={(val) => {
              handleInput("name", val);
            }}
            error={currentWorkflow?.errors?.name ?? false}
          />
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
              data={triggerOptions?.map((e) => {
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
              error={currentWorkflow?.errors?.workflowType ?? false}
            />
            {currentWorkflow?.workflowType === "api" &&
              !currentWorkflow?.name && (
                // <button
                //   className="border p-1 rounded transition-all text-xs text-violet-500 border-violet-500 hover:bg-violet-500 hover:text-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
                //   onClick={handleGenerateCurl}
                //   disabled={!currentWorkflow.name || generateCurlLoading}>
                //   Generate Curl
                // </button>
                <p className="text-sm">(Enter workflow name to see the curl)</p>
              )}
            {generateCurlLoading && <CircularProgress size={20} />}
          </div>
        </div>
        <HandleWorkflowType />
        <PlaybookDetails />
      </div>
    </>
  );
}

export default BasicDetails;
