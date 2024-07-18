import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  updateSource,
} from "../../../../store/features/playbook/playbookSlice.ts";
import useCurrentTask from "../../../../hooks/useCurrentTask.ts";
import useIsPrefetched from "../../../../hooks/useIsPrefetched.ts";
import { InputTypes } from "../../../../types/inputs/inputTypes.ts";
import CustomInput from "../../../Inputs/CustomInput.tsx";

function SelectSource({ id }) {
  const { connectorOptions } = useSelector(playbookSelector);
  const [task, currentStepId] = useCurrentTask(id);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  function handleSourceChange(id) {
    dispatch(updateSource({ id: currentStepId, value: id }));
  }

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Data Source"
        options={connectorOptions}
        inputType={InputTypes.DROPDOWN}
        value={task?.source ?? ""}
        handleChange={handleSourceChange}
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default SelectSource;
