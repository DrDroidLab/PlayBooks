import React from "react";
import AddTaskButton from "../../Buttons/AddTaskButton/index.tsx";
import DeleteStepButton from "../../Buttons/DeleteStepButton/index.tsx";
import AddNotesAndLinks from "../../Buttons/AddNotesAndLinks/index.tsx";

type StepButtonsProps = {
  id: string;
};

function StepButtons({ id }: StepButtonsProps) {
  return (
    <div className="flex justify-between mt-2">
      <div className="flex gap-2">
        <AddTaskButton id={id} />
        <AddNotesAndLinks id={id} />
      </div>
      <DeleteStepButton id={id} />
    </div>
  );
}

export default StepButtons;
