import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import React from "react";
import { CustomTooltip } from "../../common/CustomTooltip/index.tsx";
import { StepStates } from "../../../utils/execution/StepStates.ts";
import handleTaskState from "../../../utils/execution/handleTaskState.ts";

function HandleTaskIcon({ taskId }) {
  const { state, errorMessage } = handleTaskState(taskId);

  switch (state) {
    case StepStates.LOADING:
      return <CircularProgress size={20} />;
    case StepStates.SUCCESS:
      return <CheckCircleOutline color="success" fontSize="medium" />;
    case StepStates.ERROR:
      return (
        <CustomTooltip title={errorMessage} className="!bg-red-400">
          <ErrorOutline color="error" fontSize="medium" />
        </CustomTooltip>
      );
    default:
      return;
  }
}

export default HandleTaskIcon;
