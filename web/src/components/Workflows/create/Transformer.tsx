import React from "react";
import Checkbox from "../../common/Checkbox/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import HandleTransformer from "./HandleTransformer.tsx";
import handleTransformerAvailable from "../../../utils/workflow/handleTransformerAvailable.ts";
import AlertOutput from "./AlertOutput.tsx";

const key = "useTransformer";

function Transformer() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const dispatch = useDispatch();
  const disabled = !handleTransformerAvailable.includes(
    currentWorkflow.workflowType,
  );

  const handleTransformer = (key: string) => {
    dispatch(
      setCurrentWorkflowKey({
        key: key,
        value: !currentWorkflow[key],
      }),
    );
  };

  return (
    <div>
      <Checkbox
        id={key}
        isChecked={currentWorkflow[key]}
        label="Add a Transformer"
        onChange={handleTransformer}
        isSmall={true}
        disabled={disabled}
      />
      {disabled && (
        <p className="text-xs italic text-gray-700">
          Only supported for slack triggers
        </p>
      )}
      {currentWorkflow[key] && <AlertOutput />}
      {currentWorkflow[key] && <HandleTransformer />}
    </div>
  );
}

export default Transformer;
