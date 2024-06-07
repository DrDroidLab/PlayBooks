import React from "react";
import { useDispatch } from "react-redux";
import { toggleNotesVisibility } from "../../../store/features/playbook/playbookSlice.ts";
import Notes from "./Notes.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function HandleNotesRender({ step, index }) {
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const toggleNotes = () => {
    dispatch(toggleNotesVisibility(index));
  };

  return (
    <div>
      {!isPrefetched ? (
        step.notes ? (
          <>
            <div className="mt-2 text-sm cursor-pointer text-violet-500">
              <b>Notes</b>
            </div>
            <Notes step={step} index={index} />
          </>
        ) : (
          <>
            <div
              className="mt-2 text-sm cursor-pointer text-violet-500"
              onClick={toggleNotes}>
              <b>{step.showNotes ? "-" : "+"}</b> Add Notes about this step
            </div>
            {step.showNotes && <Notes step={step} index={index} />}
          </>
        )
      ) : (
        step.notes && (
          <>
            <div className="mt-2 text-sm cursor-pointer text-violet-500">
              <b>Notes</b>
            </div>
            <Notes step={step} index={index} />
          </>
        )
      )}
    </div>
  );
}

export default HandleNotesRender;
