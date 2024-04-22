import React from "react";
import Heading from "../Heading.js";
import ValueComponent from "../ValueComponent/index.jsx";
import SelectComponent from "../SelectComponent/index.jsx";
import { useGetPlaybooksQuery } from "../../store/features/playbook/api/index.ts";
import { CircularProgress } from "@mui/material";
import { actionOptions, scheduleOptions } from "../../utils/triggerOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentTriggerSelctor,
  setKey,
} from "../../store/features/triggersBeta/triggersBetaSlice.ts";
import { RefreshRounded } from "@mui/icons-material";

function CreateTrigger() {
  const {
    data,
    isFetching: playbooksLoading,
    refetch,
  } = useGetPlaybooksQuery({});
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
      <Heading heading={"Create Workflow"} />
      <div class="p-6 flex flex-col gap-6">
        <div class="flex gap-4">
          <div class="space-y-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="playbook">
              Workflow Name
            </label>
            <ValueComponent
              valueType={"STRING"}
              placeHolder={"Enter workflow name"}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex gap-2 items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="playbook">
              Select Playbook
              <a
                href="/playbooks/create"
                rel="noreferrer"
                target="_blank"
                className="border border-violet-500 p-1 rounded text-violet-500 hover:bg-violet-500 hover:text-white transition-all text-xs">
                + Add New
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
                onSelectionChange={() => {}}
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
        <hr />
        <div>
          <label class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
            Schedule
            <p className="text-gray-500 text-xs italic">Select one of these</p>
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
                    : "text-gray-500"
                } p-2 text-sm hover:bg-violet-200 cursor-pointer transition-all`}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
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
        <hr />
        <div>
          <label class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
            Actions
            <p className="text-gray-500 text-xs italic">Select one of these</p>
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
                    : "text-gray-500"
                } p-2 text-sm hover:bg-violet-200 cursor-pointer transition-all`}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
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
                    length={400}
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
