import React, { useEffect } from "react";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import getNestedValue from "../../../utils/getNestedValue.ts";
import HandleInputRender from "../../Inputs/HandleInputRender.tsx";
import handleChangeInput from "./utils/handleChange.ts";
import { useDispatch } from "react-redux";
import { duplicateTask } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

export default function OptionRender({ data, removeErrors, id }) {
  const [task, currentTaskId] = useCurrentTask(id);
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()]?.type ?? "";
  const key = `${source.toLowerCase()}.${taskType.toLowerCase()}.${data.key}`;
  const value = getNestedValue(task, key, undefined);
  const taskData = task?.[source?.toLowerCase()]?.[taskType?.toLowerCase()];
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const handleAddClick = () => {
    dispatch(duplicateTask({ id, keyToBeRemoved: data.key }));
  };

  useEffect(() => {
    if (data.default && !value) {
      updateCardById(key, data.default, currentTaskId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.default, currentTaskId, key]);

  useEffect(() => {
    if (task?.ui_requirement.errors?.[data.key]) {
      if (getNestedValue(taskData, data.key) || data.isOptional) {
        removeErrors(data.key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.ui_requirement.errors]);

  const error = data.key
    ? task?.ui_requirement?.showError &&
      !data.selected &&
      !data.isOptional &&
      !getNestedValue(
        task?.[source?.toLowerCase()][taskType?.toLowerCase()],
        data.key,
      )
    : false;

  return (
    <HandleInputRender
      {...data}
      error={error}
      handleChange={handleChangeInput(
        data.type,
        key,
        currentTaskId!,
        removeErrors,
        data.handleChange,
        data.handleKeyChange,
      )}
      handleAddClick={handleAddClick}
      value={value ?? data.value}
      disabled={isPrefetched}
    />
  );
}
