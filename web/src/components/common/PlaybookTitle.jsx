import React from "react";
import ValueComponent from "../ValueComponent";
import EditIcon from "@mui/icons-material/Edit";
import { CircularProgress } from "@mui/material";
import { Check, CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import useIsPrefetched from "../../hooks/useIsPrefetched.ts";
import { updateCardById } from "../../utils/execution/updateCardById.ts";
import RunButton from "../Buttons/RunButton/index.tsx";
import useCurrentStep from "../../hooks/useCurrentStep.ts";

function PlaybookTitle({ id }) {
  const isPrefetched = useIsPrefetched();
  const [step] = useCurrentStep(id);

  const editCardTitle = (e) => {
    e.stopPropagation();
    updateCardById("editTitle", true, id);
  };

  const cancelEditCardTitle = (e) => {
    e.stopPropagation();
    updateCardById("editTitle", false, id);
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full mr-2">
      <div
        style={{
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
        {(step.outputLoading || step.inprogress) && (
          <CircularProgress size={20} />
        )}
        {(step.outputError || Object.keys(step?.errors ?? {}).length > 0) && (
          <ErrorOutline color="error" size={20} />
        )}
        {!step.outputError &&
          !step.outputLoading &&
          step.showOutput &&
          step.outputs?.data?.length > 0 &&
          Object.keys(step?.errors ?? {}).length === 0 && (
            <CheckCircleOutline color="success" size={20} />
          )}

        {!step.editTitle && (
          <div>
            <b>
              {step.stepIndex + 1}:{" "}
              {step.description || `Step - ${step.stepIndex + 1}`}
            </b>
            {!isPrefetched && (
              <button onClick={editCardTitle}>
                <EditIcon
                  sx={{ zIndex: "10" }}
                  fontSize={"small"}
                  style={{ marginLeft: "5px" }}
                />
              </button>
            )}
          </div>
        )}
      </div>{" "}
      {step.editTitle && (
        <div className="flex items-center">
          <ValueComponent
            placeHolder={`Enter Title`}
            valueType={"STRING"}
            onValueChange={(val) => {
              updateCardById("description", val, id);
              if (val.trim())
                updateCardById("userEnteredDescription", true, id);
            }}
            value={step.description}
            length={200}
          />
          <button className="ml-2 text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded">
            <Check onClick={cancelEditCardTitle} fontSize="inherit" />
          </button>
        </div>
      )}
      <RunButton id={id} />
    </div>
  );
}

export default PlaybookTitle;
