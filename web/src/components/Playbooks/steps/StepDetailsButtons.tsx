import React from "react";
import DeleteStepButton from "../../Buttons/DeleteStepButton/index.tsx";
import AddTaskButton from "../../Buttons/AddTaskButton/index.tsx";
import RunStepButton from "../../Buttons/RunStepButton/index.tsx";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";

function StepDetailsButtons({ id }) {
  const isPrefetched = useIsPrefetched();

  return (
    <div className="flex gap-2 mt-2">
      <RunStepButton id={id} />
      {!isPrefetched && (
        <>
          <AddTaskButton id={id} />
          <DeleteStepButton id={id} />
        </>
      )}
    </div>
  );
}

export default StepDetailsButtons;
