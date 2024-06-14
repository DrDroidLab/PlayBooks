import React from "react";
import TypingDropdown from "../common/TypingDropdown/index.tsx";

function AddCondition() {
  return (
    <div className="bg-white rounded p-1 shadow-md w-[200px]">
      <h1 className="text-violet-500 font-semibold text-sm">Add Condition</h1>

      <div>
        <TypingDropdown
          data={[]}
          selected={""}
          placeholder={`Select Metric`}
          handleChange={() => {}}
        />
      </div>
    </div>
  );
}

export default AddCondition;
