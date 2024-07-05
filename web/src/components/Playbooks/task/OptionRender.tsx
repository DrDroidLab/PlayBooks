import React, { useEffect } from "react";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";
import getNestedValue from "../../../utils/getNestedValue.ts";
import HandleInputRender from "../../Inputs/HandleInputRender.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import { InputType } from "zlib";

export default function OptionRender({ data, removeErrors, id }) {
  const [task, currentTaskId] = useCurrentTask(id);
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()]?.type ?? "";
  const key = `${source.toLowerCase()}.${taskType.toLowerCase()}.${data.key}`;
  const value = getNestedValue(task, key, undefined);
  const taskData = task?.[source?.toLowerCase()]?.[taskType?.toLowerCase()];

  useEffect(() => {
    if (data.default) {
      updateCardById(data.key, data.default, currentTaskId);
    }
  }, [data.default, currentTaskId, data.key]);

  useEffect(() => {
    if (task?.ui_requirement.errors?.[data.key]) {
      if (getNestedValue(taskData, data.key)) {
        removeErrors(data.key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.ui_requirement.errors]);

  const handleChange = (val: string, ...args: any) => {
    if (data.handleChange) {
      data.handleChange(val);
    } else {
      updateCardById(key, val, currentTaskId);
    }

    removeErrors(key);
  };

  const handleTypingDropdownChange = (value, option) => {
    if (data.handleChange && option) {
      data.handleChange(value, option);
    } else if (data.handleKeyChange) {
      data.handleKeyChange(value);
    } else {
      updateCardById(key, value, currentTaskId);
    }

    removeErrors(key);
  };

  function handleChangeValue(type: InputType) {
    switch (type) {
      case InputTypes.TEXT:
      case InputTypes.TEXT_ROW:
      case InputTypes.MULTILINE:
        return handleChange;
      case InputTypes.TYPING_DROPDOWN:
        return handleTypingDropdownChange;
      default:
        return () => null;
    }
  }

  const error = data.key
    ? task?.ui_requirement?.showError &&
      !data.selected &&
      !task?.[source?.toLowerCase()][taskType?.toLowerCase()][`${data.key}`]
    : false;

  return (
    <HandleInputRender
      {...data}
      error={error}
      handleChange={() => handleChangeValue(data.type)}
      value={value}
    />
  );
}
