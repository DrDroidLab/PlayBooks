import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  updateSource,
} from "../../../../store/features/playbook/playbookSlice.ts";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import SelectComponent from "../../../SelectComponent";

function SelectSource({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [task, currentStepId] = useCurrentTask(id);
  const dispatch = useDispatch();

  function handleSourceChange(id) {
    dispatch(updateSource({ id: currentStepId, value: id }));
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
