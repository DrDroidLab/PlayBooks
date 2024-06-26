import React, { useState } from "react";
import ValueComponent from "../../ValueComponent";
import { Close } from "@mui/icons-material";
import AddWorkflowVariableOverlay from "./AddWorkflowVariableOverlay";
import {
  currentWorkflowSelector,
  deleteGlobalVariable,
  updateGlobalVariable,
} from "../../../store/features/workflow/workflowSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../common/CustomButton/index.tsx";

function WorkflowGlobalVariables() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const dispatch = useDispatch();
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false);

  const openOverlay = () => {
    setIsAddVariableOpen(true);
  };

  const handleDelete = (index) => {
    dispatch(deleteGlobalVariable({ index }));
  };

  return (
    <div className="text-sm border p-2 rounded">
      <div style={{ paddingLeft: 0 }} className="flex items-center gap-2 p-1">
        <CustomButton onClick={openOverlay}>+ Add Variable</CustomButton>
        {currentWorkflow?.globalVariables?.length > 0 &&
          `(${currentWorkflow?.globalVariables?.length} variable${
            currentWorkflow?.globalVariables?.length > 1 ? "s" : ""
          })`}
      </div>
      <hr />
      <div className="flex items-center flex-wrap mt-2">
        {currentWorkflow?.globalVariables?.length > 0 ? (
          currentWorkflow?.globalVariables.map((variable, index) => (
            <div
              key={index}
              className={`flex flex-wrap p-2 items-center gap-1`}>
              <div className="bg-violet-100 p-1 rounded">{variable.name}</div>
              <div className="flex gap-1 items-center">
                <ValueComponent
                  valueType={"STRING"}
                  value={variable.value}
                  placeHolder={"Enter variable value"}
                  length={200}
                  onValueChange={(val) => {
                    dispatch(updateGlobalVariable({ index, value: val }));
                  }}
                />
                <Close
                  className="cursor-pointer"
                  fontSize="small"
                  onClick={() => handleDelete(index)}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            Variables defined in the workflow will be visible here
          </p>
        )}
      </div>

      <AddWorkflowVariableOverlay
        isOpen={isAddVariableOpen}
        close={() => setIsAddVariableOpen(false)}
      />
    </div>
  );
}

export default WorkflowGlobalVariables;
