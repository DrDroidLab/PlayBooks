import React from "react";
import ValueComponent from "../ValueComponent";
import EditIcon from "@mui/icons-material/Edit";
import { CircularProgress } from "@mui/material";
import { Check, CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import useIsPrefetched from "../../hooks/useIsPrefetched.ts";
import { updateCardByIndex } from "../../utils/execution/updateCardByIndex.ts";
import RunButton from "../Buttons/RunButton/index.tsx";

function PlaybookTitle({ step, index }) {
  const isPrefetched = useIsPrefetched();
  const editCardTitle = (e) => {
    e.stopPropagation();
    updateCardByIndex("editTitle", true, index);
  };

  const cancelEditCardTitle = (e) => {
    e.stopPropagation();
    updateCardByIndex("editTitle", false, index);
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
              {index + 1}: {step.description || `Step - ${index + 1}`}
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
              updateCardByIndex("description", val, index);
              if (val.trim())
                updateCardByIndex("userEnteredDescription", true, index);
            }}
            value={step.description}
            length={200}
          />
          <button className="ml-2 text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded">
            <Check onClick={cancelEditCardTitle} fontSize="inherit" />
          </button>
        </div>
      )}
      <RunButton index={index} />
    </div>
  );
}

export default PlaybookTitle;
