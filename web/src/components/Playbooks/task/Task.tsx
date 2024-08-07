/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteTask } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";
import { Delete } from "@mui/icons-material";
import RunButton from "../../Buttons/RunButton/index.tsx";
import SavePlaybookButton from "../../Buttons/SavePlaybookButton/index.tsx";
import TaskQuery from "./TaskQuery.tsx";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";

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
        <div>
          <div
            className="mt-2 text-sm cursor-pointer text-violet-500"
            onClick={() => setAddQuery(true)}>
            <b>{!addQuery ? "+ Add Data" : "Data"}</b>
          </div>

          {addQuery && <TaskQuery id={currentTaskId} />}
        </div>
        {/* <SelectInterpretation id={currentTaskId} /> */}

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
            <SavePlaybookButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default Task;
