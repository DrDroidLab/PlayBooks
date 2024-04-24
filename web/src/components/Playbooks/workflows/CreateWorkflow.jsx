import React from "react";
import Heading from "../../Heading.js";
import BasicDetails from "./BasicDetails.jsx";
import ScheduleDetails from "./ScheduleDetails.jsx";
import NotificationDetails from "./NotificationDetails.jsx";

function CreateTrigger() {
  return (
    <div>
      <Heading heading={"Create Workflow"} />
      <div className="p-6 flex flex-col gap-6 bg-white border rounded m-2">
        <BasicDetails />
        <hr />
        <ScheduleDetails />
        <hr />
        <NotificationDetails />
        <div className="flex items-center">
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
