import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import React from "react";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

function HandleTaskIcon({ taskId }) {
  const [task] = useCurrentTask(taskId);

  return (
    <div>
      {task?.ui_requirement?.outputLoading && <CircularProgress size={20} />}
      {(task?.ui_requirement?.outputError ||
        Object.keys(task?.ui_requirement?.errors ?? {}).length > 0) && (
        <ErrorOutline color="error" fontSize="medium" />
      )}
      {!task?.ui_requirement?.outputError &&
        !task?.ui_requirement?.outputLoading &&
        task?.ui_requirement?.showOutput &&
        task?.ui_requirement?.outputs?.data?.length > 0 &&
        Object.keys(task?.ui_requirement?.errors ?? {}).length === 0 && (
          <CheckCircleOutline color="success" fontSize="medium" />
        )}
    </div>
  );
}

export default HandleTaskIcon;
