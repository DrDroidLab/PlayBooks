/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteTask } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import ExternalLinksList from "../../common/ExternalLinksList/index.tsx";
import SelectInterpretation from "../steps/Interpretation.jsx";
import { Delete } from "@mui/icons-material";
import HandleNotesRender from "../steps/HandleNotesRender.tsx";
import RunButton from "../../Buttons/RunButton/index.tsx";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import SavePlaybookButton from "../../Buttons/SavePlaybookButton/index.tsx";
import React from "react";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import TaskQuery from "./TaskQuery.tsx";

function Task({ id }) {
  const [task, currentTaskId] = useCurrentTask(id);
  const { closeDrawer } = usePermanentDrawerState();
  const isPrefetched = useIsPrefetched();
  const [addQuery, setAddQuery] = useState(task?.source ?? false);
  const dispatch = useDispatch();

  function handleDeleteClick() {
    dispatch(deleteTask(id));
    closeDrawer();
  }

  return (
    <div className="rounded my-2">
      <div className="flex flex-col">
        <div className="flex text-sm">
          {isPrefetched && task?.description && (
            <div className="flex gap-5">
              <ExternalLinksList id={currentTaskId} />
            </div>
          )}
        </div>
        <div>
          <div
            className="mt-2 text-sm cursor-pointer text-violet-500"
            onClick={() => setAddQuery(true)}>
            <b>{!addQuery ? "+ Add Data" : "Data"}</b>
          </div>

          {addQuery && <TaskQuery id={currentTaskId} />}
        </div>
        <HandleNotesRender id={currentTaskId} />
        <SelectInterpretation id={currentTaskId} />

        {!isPrefetched && (
          <div className="flex gap-2 mt-2">
            <RunButton id={currentTaskId ?? ""} />
            <button
              className="text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded"
              onClick={handleDeleteClick}>
              <Tooltip title="Remove this Step">
                <Delete />
              </Tooltip>
            </button>
          </div>
        )}
        {!isPrefetched && (
          <div className="flex mt-2">
            <SavePlaybookButton shouldNavigate={false} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Task;
