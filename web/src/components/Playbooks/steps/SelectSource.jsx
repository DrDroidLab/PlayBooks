import React from "react";
import SelectComponent from "../../SelectComponent";
import {
  playbookSelector,
  updateStep,
} from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useStepDetails from "../../../hooks/useStepDetails.ts";

function SelectSource() {
  const { currentStepIndex, connectorOptions } = useSelector(playbookSelector);
  const { source } = useStepDetails();
  const isPrefetched = useIsPrefetched();
  const dispatch = useDispatch();

  function handleSourceChange(id) {
    dispatch(
      updateStep({
        currentStepIndex,
        key: "source",
        value: id,
      }),
    );
  }

  return (
    <SelectComponent
      data={connectorOptions}
      placeholder="Select Data Source"
      onSelectionChange={handleSourceChange}
      selected={source}
      searchable={true}
      disabled={isPrefetched}
    />
  );
}

export default SelectSource;
