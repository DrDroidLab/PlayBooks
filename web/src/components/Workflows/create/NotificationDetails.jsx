import React from "react";
import { notificationOptions } from "../../../utils/workflow/notificationOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import { handleInput, handleSelect } from "../utils/handleInputs.ts";
import SelectComponent from "../../SelectComponent/index.jsx";
import { useGetTriggerOptionsQuery } from "../../../store/features/triggers/api/getTriggerOptionsApi.ts";
import { CircularProgress } from "@mui/material";
// import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender.jsx";

function NotificationDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const { data: options, isFetching } = useGetTriggerOptionsQuery();
  const dispatch = useDispatch();

  return (
    <div>
      <label className="text-sm mb-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        Notifications
      </label>

      {/* {notificationOptions.map((option) => (
        <HandleInputRender key={option.id} option={option} />
      ))} */}
      {notificationOptions[0].options.map((option, index) =>
        currentWorkflow.workflowType !== "slack" &&
        option.id === "reply-to-alert" ? (
          <div key={option.id}></div>
        ) : (
          <button
            key={option.id}
            data-type="notification"
            onClick={(e) => {
              if (currentWorkflow.notification === option.id) {
                dispatch(
                  setCurrentWorkflowKey({
                    key: "notification",
                    value: undefined,
                  }),
                );
              } else {
                handleSelect(e, option);
              }
            }}
            className={`${
              currentWorkflow.notification === option.id
                ? "!bg-white !text-violet-500 border-violet-500"
                : "text-gray-500 bg-gray-50 border-gray-200"
            } ${index === options.length - 1 ? "rounded-r" : ""} ${
              index === 0 ? "rounded-l" : ""
            } p-2 text-sm hover:bg-gray-100 cursor-pointer transition-all border`}>
            {option.label}
          </button>
        ),
      )}

      {currentWorkflow.notification === "slack_message" && (
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs font-bold text-gray-500">Select Channel</p>
          {isFetching && <CircularProgress size={20} />}
          <SelectComponent
            data={options?.active_channels?.map((e) => {
              return {
                id: e.channel_id,
                label: e.channel_name,
                channel: e,
              };
            })}
            placeholder="Select Channel"
            onSelectionChange={(_, val) => {
              handleInput("channel", val.channel);
            }}
            selected={
              currentWorkflow?.channel?.channel_id ||
              currentWorkflow?.trigger?.channel?.channel_id ||
              ""
            }
            error={currentWorkflow?.errors?.channel ?? false}
            searchable={true}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationDetails;
