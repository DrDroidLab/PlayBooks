/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
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
import PlaybookDetails from "./PlaybookDetails.js";
import { useGenerateWebhookMutation } from "../../../store/features/workflow/api/generateWebHookApi.ts";
import SummaryOptions from "./SummaryOptions.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import Transformer from "./Transformer.tsx";
import { useGenerateZendutyWebHookMutation } from "../../../store/features/workflow/api/generateZendutyWebHookApi.ts";

function BasicDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [triggerGenerateCurl, { isLoading: generateCurlLoading }] =
    useGenerateCurlMutation();
  const [triggerGenerateWebhook, { isLoading: generateWebhookLoading }] =
    useGenerateWebhookMutation();
  const [
    triggerGenerateZendutyWebhook,
    { isLoading: generateZendutyWebhookLoading },
  ] = useGenerateZendutyWebHookMutation();
  const dispatch = useDispatch();
  const loading =
    generateCurlLoading ||
    generateWebhookLoading ||
    generateZendutyWebhookLoading;

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

  const handleGenerateWebhook = async (tool_name: string) => {
    await triggerGenerateWebhook({
      workflow_name: currentWorkflow.name,
      tool_name,
    });
  };

  const handleGenerateZendutyWebhook = async () => {
    await triggerGenerateZendutyWebhook();
  };

  const handleWorkflowType = () => {
    switch (currentWorkflow?.workflowType) {
      case "api":
        handleGenerateCurl();
        dispatch(
          setCurrentWorkflowKey({
            key: "useTransformer",
            value: false,
          }),
        );
        return;
      case "pagerduty_incident":
        handleGenerateWebhook("pagerduty");
        dispatch(
          setCurrentWorkflowKey({
            key: "useTransformer",
            value: false,
          }),
        );
        return;
      case "rootly_incident":
        handleGenerateWebhook("rootly");
        dispatch(
          setCurrentWorkflowKey({
            key: "useTransformer",
            value: false,
          }),
        );
        return;
      case "zenduty_incident":
        handleGenerateZendutyWebhook();
        dispatch(
          setCurrentWorkflowKey({
            key: "useTransformer",
            value: false,
          }),
        );
        return;
      default:
        return;
    }
  };

  useEffect(() => {
    handleWorkflowType();
  }, [currentWorkflow.name, currentWorkflow?.workflowType]);

  return (
    <>
      <div className="flex gap-4">
        <div className="space-y-2">
          <CustomInput
            label="Workflow Name"
            inputType={InputTypes.TEXT}
            value={currentWorkflow.name}
            handleChange={(val) => {
              handleInput("name", val);
            }}
            error={currentWorkflow?.errors?.name ?? false}
            className="!w-[200px]"
          />
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex">
            <label
              className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="playbook">
              Trigger Type
            </label>
            &nbsp;
            <p className="flex gap-1 items-center text-sm font-small leading-none decoration-underline peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              (Read more about triggers{" "}
              <a
                rel="noreferrer"
                style={{ color: "#9553fe" }}
                href="https://docs.drdroid.io/docs/workflows#triggers"
                target="_blank">
                here
              </a>
              )
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <CustomInput
              inputType={InputTypes.DROPDOWN}
              options={triggerOptions?.map((e) => {
                return {
                  id: e.id,
                  label: e.label,
                };
              })}
              placeholder={`Select Workflow Type`}
              handleChange={(id) => {
                const val = triggerOptions.find((e) => e.id === id);
                handleSelect("workflowType", val);
              }}
              value={currentWorkflow?.workflowType}
              searchable={true}
              error={currentWorkflow?.errors?.workflowType ?? false}
              suffix={
                currentWorkflow?.workflowType === "api" &&
                !currentWorkflow?.name && (
                  <p className="text-sm">
                    (Enter workflow name to see the curl)
                  </p>
                )
              }
            />
            {loading && <CircularProgress size={20} />}
          </div>
        </div>
        <HandleWorkflowType />
        <hr />
        <PlaybookDetails />
        <SummaryOptions />
        <Transformer />
      </div>
    </>
  );
}

export default BasicDetails;
