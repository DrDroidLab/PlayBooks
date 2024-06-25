import React from "react";
import SelectComponent from "../../SelectComponent";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";

function SelectSource({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [step, currentStepId] = useCurrentStep(id);
  const isPrefetched = useIsPrefetched();

  function handleSourceChange(id) {
    updateCardById("source", id, currentStepId);
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
