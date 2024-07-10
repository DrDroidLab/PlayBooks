import React from "react";
import Checkbox from "../../common/Checkbox/index.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import HandleTransformer from "./HandleTransformer.tsx";

const key = "useTransformer";

function Transformer() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const dispatch = useDispatch();

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
        label="Use Transformer"
        onChange={handleTransformer}
        isSmall={true}
      />
      {currentWorkflow[key] && <HandleTransformer />}
    </div>
  );
}

export default Transformer;
