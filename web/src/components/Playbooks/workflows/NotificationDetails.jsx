import React from "react";
import { notificationOptions } from "../../../utils/workflow/notificationOptions.ts";
import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender.jsx";

function NotificationDetails() {
  return (
    <div>
      <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        Notifications
      </label>

      {notificationOptions.map((option) => (
        <HandleInputRender key={option.id} option={option} />
      ))}
    </div>
  );
}

export default NotificationDetails;
