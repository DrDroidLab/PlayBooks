import React from "react";
import { notificationOptions } from "../../../utils/workflow/notificationOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import { handleSelect } from "../utils/handleInputs.ts";
import { useGetTriggerOptionsQuery } from "../../../store/features/triggers/api/getTriggerOptionsApi.ts";
import handleNotificationOptions from "../../../utils/workflow/handleNotificationOptions.ts";
import HandleNotificationOption from "./HandleNotificationOption.js";

function NotificationDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const { data: options } = useGetTriggerOptionsQuery();
  const dispatch = useDispatch();

  const notificationOptionsList = notificationOptions[0].options.filter((e) =>
    handleNotificationOptions().includes(e.id),
  );

  return (
    <div>
      <label className="text-sm mb-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        Notifications
      </label>

      {notificationOptionsList.map((option, index) => (
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
          } ${index === options?.length - 1 ? "rounded-r" : ""} ${
            index === 0 ? "rounded-l" : ""
          } p-1 text-xs hover:bg-gray-100 cursor-pointer transition-all border`}>
          {option.label}
        </button>
      ))}

      <HandleNotificationOption />
    </div>
  );
}

export default NotificationDetails;
