import React from "react";
import { notificationOptions } from "../../../utils/workflow/notificationOptions.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import { handleSelect } from "../utils/handleInputs.ts";
// import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender.jsx";

function NotificationDetails() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const dispatch = useDispatch();

  return (
    <div>
      <label className="text-sm mb-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        Notifications
      </label>

      {/* {notificationOptions.map((option) => (
        <HandleInputRender key={option.id} option={option} />
      ))} */}
      {notificationOptions[0].options.map((option) =>
        currentWorkflow.workflowType !== "slack" &&
        option.id === "reply-to-alert" ? (
          <></>
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
            } p-2 text-sm hover:bg-gray-100 cursor-pointer transition-all rounded border`}>
            {option.label}
          </button>
        ),
      )}
    </div>
  );
}

export default NotificationDetails;
