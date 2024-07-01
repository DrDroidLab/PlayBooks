import React from "react";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../../store/features/playbook/playbookSlice";
import useCurrentTask from "../../../../hooks/useCurrentTask";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import SelectComponent from "../../../SelectComponent";

function SelectSource({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [task, currentStepId] = useCurrentTask(id);

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
        selected={task?.source}
        searchable={true}
      />
    </div>
  );
}

export default SelectSource;
