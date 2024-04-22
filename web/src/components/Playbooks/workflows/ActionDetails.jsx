import React from "react";
import { notificationOptions } from "../../../utils/workflow/notificationOptions.ts";
import { HandleRender } from "../../../utils/workflow/handleRender.tsx";

function ActionDetails() {
  return (
    <div>
      <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block font-medium">
        Notifications
      </label>

      {notificationOptions.map((option) => (
        <HandleRender option={option} />
      ))}
    </div>
  );
}

export default ActionDetails;
