import React from "react";
import DeleteStepButton from "../../Buttons/DeleteStepButton/index.tsx";
import AddTaskButton from "../../Buttons/AddTaskButton/index.tsx";
import RunStepButton from "../../Buttons/RunStepButton/index.tsx";

function StepDetailsButtons({ id }) {
  return (
    <div className="flex gap-2 mt-2">
      <RunStepButton id={id} />
      <AddTaskButton id={id} />
      <DeleteStepButton id={id} />
    </div>
  );
}

export default StepDetailsButtons;
