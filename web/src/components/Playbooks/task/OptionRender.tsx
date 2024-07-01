import React from "react";
import SelectComponent from "../../SelectComponent";
import ValueComponent from "../../ValueComponent";
import TypingDropdown from "../../common/TypingDropdown/index.tsx";
import TypingDropdownMultiple from "../../common/TypingDropdownMultiple/index.tsx";
import { updateCardById } from "../../../utils/execution/updateCardById.ts";
import IframeRender from "../options/IframeRender.tsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

export default function OptionRender({ data, removeErrors, id }) {
  const [task, currentTaskId] = useCurrentTask(id);
  const source = task?.source ?? "";
  const taskType = task?.[source?.toLowerCase()]?.type ?? "";
  const taskData =
    task?.[source?.toLowerCase()]?.[taskType?.toLowerCase()] ?? {};

  const handleChange = (...args) => {
    if (data.handleChange) {
      data.handleChange(...args);
    } else {
      updateCardById(data.key, args[0], currentTaskId);
    }

    removeErrors(data.key);
  };

  const handleTextAreaChange = (e) => {
    const val = e.target.value;
    if (data.handleChange) {
      data.handleChange(e);
    } else {
      updateCardById(data.key, val, currentTaskId);
    }

    removeErrors(data.key);
  };

  const multiSelectChange = (...args) => {
    if (data.handleChange) {
      data.handleChange(...args);
    } else {
      updateCardById(data.key, args[0], currentTaskId);
    }

    removeErrors(data.key);
  };

  const handleTypingDropdownChange = (value, option) => {
    if (data.handleChange && option) {
      data.handleChange(value, option);
    } else {
      updateCardById(data.key, value, currentTaskId);
    }

    removeErrors(data.key);
  };

  const error = data.key
    ? task?.ui_requirement?.showError &&
      !data.selected &&
      !task?.[source?.toLowerCase()][taskType?.toLowerCase()][`${data.key}`]
    : false;

  switch (data.type) {
    case "options":
      // if (!(data.options?.length > 0)) return;
      return (
        <div key={data.key} className={`flex flex-col`}>
          <p
            style={{
              fontSize: "13px",
              color: "#676666",
            }}>
            <b>{data.label}</b>
          </p>
          <SelectComponent
            key={data.key}
            data={data.options ?? []}
            placeholder={`Select ${data.label}`}
            onSelectionChange={handleChange}
            selected={data.selected ?? taskData[`${data.key}`]}
            searchable={true}
            disabled={data.disabled}
            error={error}
            containerClassName={"w-56"}
            {...data.additionalProps}
          />
        </div>
      );
    case "text-row":
    case "text":
      return (
        <div
          className={`flex ${
            data.type === "text"
              ? "flex-col"
              : "flex-row items-center justify-center gap-2"
          } ${data.type === "text" ? "" : "mt-2"}`}>
          <p
            style={{
              marginTop: data.type === "text" ? "10px" : "",
              fontSize: "13px",
              color: "#676666",
            }}>
            <b>{data.label}</b>
          </p>
          <ValueComponent
            key={data.key}
            placeHolder={`Enter ${data?.label}`}
            valueType={"STRING"}
            onValueChange={handleChange}
            value={data.selected || taskData[`${data.key}`]}
            error={error}
            disabled={false}
            {...data.additionalProps}
          />
        </div>
      );
    case "multiline":
      return (
        <div key={data.key} className="flex flex-col w-full">
          <p className="mt-2 text-sm text-gray-500">
            <b>{data.label}</b>
          </p>
          <textarea
            className={
              "w-full border border-gray-300 p-1 rounded mt-1 text-sm resize-none text-[#676666] h-32"
            }
            rows={4}
            value={data.value ?? data.selected ?? taskData[`${data.key}`]}
            onChange={handleTextAreaChange}
            disabled={data.disabled}
            style={error ? { borderColor: "red" } : {}}
          />
        </div>
      );

    case "button":
      return (
        <button
          className="p-1 border-2 w-fit border-purple-500 hover:bg-purple-500 text-purple-500 hover:text-white transition-all rounded cursor-pointer leading-none"
          onClick={data.handleClick}>
          {data.label}
        </button>
      );

    case "iframe-render":
      return <IframeRender url={data.value} />;

    case "multi-select":
      // if (!(data.options?.length > 0)) return;
      return (
        <div key={data.key} className={`flex flex-col`}>
          <p
            style={{
              fontSize: "13px",
              color: "#676666",
            }}>
            <b>{data.label}</b>
          </p>
          <TypingDropdownMultiple
            data={data.options ?? []}
            selected={data.selected ?? taskData[`${data.key}`]}
            placeholder={data.placeholder ?? `Select ${data.label}`}
            handleChange={multiSelectChange}
            disabled={data.disabled}
            error={error}
            selectedDisplayKey={data.selectedDisplayKey}
            selectedValuesKey={data.selectedValuesKey ?? data.key}
            {...data.additionalProps}
          />
        </div>
      );

    case "typing-dropdown":
      return (
        <div key={data.key} className={`flex flex-col`}>
          <p
            style={{
              fontSize: "13px",
              color: "#676666",
            }}>
            <b>{data.label}</b>
          </p>
          <div className="flex gap-1 items-center">
            <TypingDropdown
              data={data.options ?? []}
              selected={data.selected ?? taskData[`${data.key}`]}
              placeholder={data.placeholder ?? `Select ${data.label}`}
              handleChange={handleTypingDropdownChange}
              disabled={data.disabled}
              error={error}
              {...data.additionalProps}
            />
            <p className="text-xs shrink-0 text-gray-500 font-semibold">
              {data.helperText}
            </p>
          </div>
        </div>
      );
    default:
      return;
  }
}
