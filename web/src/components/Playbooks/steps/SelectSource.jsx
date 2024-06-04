import React from "react";
import SelectComponent from "../../SelectComponent";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";

function SelectSource({ index }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [step, currentStepIndex] = useCurrentStep(index);
  const isPrefetched = useIsPrefetched();

  function handleSourceChange(id) {
    updateCardByIndex("source", id, currentStepIndex);
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-500 font-bold">Data Source</p>
      <SelectComponent
        data={connectorOptions}
        placeholder="Select Data Source"
        onSelectionChange={handleSourceChange}
        selected={step?.source}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectSource;
