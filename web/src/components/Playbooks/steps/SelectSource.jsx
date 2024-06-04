import React from "react";
import SelectComponent from "../../SelectComponent";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { useSelector } from "react-redux";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import getCurrentTask from "../../../utils/getCurrentTask.ts";
import { updateCardByIndex } from "../../../utils/execution/updateCardByIndex.ts";

function SelectSource() {
  const { connectorOptions } = useSelector(playbookSelector);
  const [, index, task] = getCurrentTask();
  const isPrefetched = useIsPrefetched();

  function handleSourceChange(id) {
    updateCardByIndex("source", id, index);
  }

  console.log("task", task);

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-500 font-bold">Data Source</p>
      <SelectComponent
        data={connectorOptions}
        placeholder="Select Data Source"
        onSelectionChange={handleSourceChange}
        selected={task?.source}
        searchable={true}
        disabled={isPrefetched}
      />
    </div>
  );
}

export default SelectSource;
