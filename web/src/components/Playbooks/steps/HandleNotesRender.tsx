import React from "react";
import { useDispatch } from "react-redux";
import { toggleNotesVisibility } from "../../../store/features/playbook/playbookSlice.ts";
import Notes from "./Notes.js";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep.ts";

function HandleNotesRender({ id }) {
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const [step] = useCurrentStep(id);

  const toggleNotes = () => {
    dispatch(toggleNotesVisibility({ id }));
  };

  if (!step) return;

  return (
    <div>
      {!isPrefetched ? (
        step.notes ? (
          <>
            <div className="mt-2 text-sm cursor-pointer text-violet-500">
              <b>Notes</b>
            </div>
            <Notes id={id} />
          </>
        ) : (
          <>
            <div
              className="mt-2 text-sm cursor-pointer text-violet-500 mb-2"
              onClick={toggleNotes}>
              <b>{step.ui_requirement.showNotes ? "-" : "+"}</b> Add Notes about
              this step
            </div>
            {step.ui_requirement.showNotes && <Notes id={id} />}
          </>
        )
      ) : (
        step.notes && (
          <>
            <div className="mt-2 text-sm cursor-pointer text-violet-500">
              <b>Notes</b>
            </div>
            <Notes id={id} />
          </>
        )
      )}
    </div>
  );
}

export default HandleNotesRender;
