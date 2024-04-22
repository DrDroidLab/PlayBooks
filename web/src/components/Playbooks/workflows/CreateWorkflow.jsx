import React from "react";
import Heading from "../../Heading.js";
import { useDispatch } from "react-redux";
import { setKey } from "../../../store/features/workflow/workflowSlice.ts";
import BasicDetails from "./BasicDetails.jsx";
import ScheduleDetails from "./ScheduleDetails.jsx";
import ActionDetails from "./ActionDetails.jsx";

function CreateTrigger() {
  const dispatch = useDispatch();

  const handleSelect = (e, option) => {
    const type = e.target?.getAttribute("data-type") ?? e;
    dispatch(
      setKey({
        key: type,
        value: option.id,
      }),
    );
  };

  const handleInput = (key, value) => {
    dispatch(
      setKey({
        key,
        value,
      }),
    );
  };

  return (
    <div>
      <Heading heading={"Create Workflow"} />
      <div className="p-6 flex flex-col gap-6 bg-white border rounded m-2">
        <BasicDetails handleInput={handleInput} handleSelect={handleSelect} />
        <hr />
        <ScheduleDetails
          handleInput={handleInput}
          handleSelect={handleSelect}
        />
        <hr />
        <ActionDetails handleInput={handleInput} handleSelect={handleSelect} />
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
