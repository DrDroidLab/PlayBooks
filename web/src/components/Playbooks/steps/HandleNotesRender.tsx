import React from "react";
import { useDispatch } from "react-redux";
import { toggleNotesVisibility } from "../../../store/features/playbook/playbookSlice.ts";
import Notes from "./Notes.jsx";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

function HandleNotesRender({ id }) {
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const [task] = useCurrentTask(id);

  const toggleNotes = () => {
    dispatch(toggleNotesVisibility({ id }));
  };

  if (!task) return;

  return (
    <div>
      {!isPrefetched ? (
        task.notes ? (
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
              <b>{task.ui_requirement.showNotes ? "-" : "+"}</b> Add Notes about
              this step
            </div>
            {task.ui_requirement.showNotes && <Notes id={id} />}
          </>
        )
      ) : (
        task.notes && (
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
