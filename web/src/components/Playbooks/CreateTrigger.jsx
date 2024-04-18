import React from "react";
import Heading from "../Heading";
import ValueComponent from "../ValueComponent";
import SelectComponent from "../SelectComponent";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api/index.ts";
import { CircularProgress } from "@mui/material";
import { actionOptions, scheduleOptions } from "../../utils/triggerOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentTriggerSelctor,
  setKey,
} from "../../store/features/triggersBeta/triggersBetaSlice.ts";

function CreateTrigger() {
  const { data, isLoading: playbooksLoading } = useGetPlaybooksQuery({});
  const dispatch = useDispatch();
  const currentTrigger = useSelector(currentTriggerSelctor);

  const handleSelect = (e, option) => {
    const type = e.target.getAttribute("data-type");
    dispatch(
      setKey({
        key: type,
        value: option.id,
      }),
    );
  };

  return (
    <div>
      <Heading heading={"Create Trigger"} />
      <div class="p-6 flex flex-col gap-6">
        <div class="flex gap-4">
          <div class="space-y-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="playbook">
              Trigger Name
            </label>
            <ValueComponent
              valueType={"STRING"}
              placeHolder={"Enter trigger name"}
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="playbook">
              Select Playbook
            </label>
            <div className="flex gap-2 items-center">
              <SelectComponent
                data={data?.playbooks.map((e) => {
                  return {
                    id: e.id,
                    label: e.name,
                    playbook: e,
                  };
                })}
                placeholder={`Select Playbook`}
                onSelectionChange={() => {}}
                searchable={true}
              />
              {playbooksLoading && <CircularProgress size={20} />}
            </div>
          </div>
        </div>
        <div>
          <label class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
            Schedule
          </label>
          <div
            class="flex items-center bg-gray-100 my-2 rounded-lg overflow-hidden"
            style={{ width: "fit-content" }}>
            {scheduleOptions.map((option) => (
              <button
                key={option.id}
                data-type="schedule"
                onClick={(e) => handleSelect(e, option)}
                className={`${
                  currentTrigger.schedule === option.id
                    ? "!bg-violet-500 !text-white"
                    : ""
                } p-2 text-sm hover:bg-violet-300 hover:text-black cursor-pointer transition-all`}>
                {option.label}
              </button>
            ))}
          </div>
          <div>
            {scheduleOptions
              .find((e) => e.id === currentTrigger.schedule)
              ?.options.map((option) => (
                <>
                  <label
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="playbook">
                    {option.label}
                  </label>
                  <ValueComponent
                    valueType={"STRING"}
                    placeHolder={`Enter ${option.label}`}
                  />
                </>
              ))}
          </div>
        </div>
        <div>
          <label class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
            Actions
          </label>
          <div
            class="flex items-center bg-gray-100 my-2 rounded-lg overflow-hidden"
            style={{ width: "fit-content" }}>
            {actionOptions.map((option) => (
              <button
                key={option.id}
                data-type="action"
                onClick={(e) => handleSelect(e, option)}
                className={`${
                  currentTrigger.action === option.id
                    ? "!bg-violet-500 !text-white"
                    : ""
                } p-2 text-sm hover:bg-violet-300 hover:text-black cursor-pointer transition-all`}>
                {option.label}
              </button>
            ))}
          </div>
          <div>
            {actionOptions
              .find((e) => e.id === currentTrigger.action)
              ?.options.map((option) => (
                <>
                  <label
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="playbook">
                    {option.label}
                  </label>
                  <ValueComponent
                    valueType={"STRING"}
                    placeHolder={`Enter ${option.label}`}
                  />
                </>
              ))}
          </div>
        </div>
        <div class="flex items-center">
          <button
            className="text-sm bg-transparent hover:bg-violet-500 p-2 border-violet-500 border hover:text-white text-violet-500 rounded transition-all"
            type="submit">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTrigger;
