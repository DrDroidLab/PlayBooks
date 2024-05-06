import React from "react";
import { useDispatch } from "react-redux";
import { updateStep } from "../../../store/features/playbook/playbookSlice.ts";
import SelectComponent from "../../SelectComponent";
import ValueComponent from "../../ValueComponent";
import styles from "./index.module.css";
import MultiSelectDropdown from "../../common/MultiSelectDropdown/index.tsx";

export default function OptionRender({ data, removeErrors, task, stepIndex }) {
  const dispatch = useDispatch();

  const handleChange = (...args) => {
    if (data.handleChange) {
      data.handleChange(...args);
    } else {
      dispatch(updateStep({ index: stepIndex, key: data.key, value: args[0] }));
    }

    removeErrors(data.key);
  };

  const handleTextAreaChange = (e) => {
    const val = e.target.value;
    if (data.handleChange) {
      data.handleChange(e);
    } else {
      dispatch(updateStep({ index: stepIndex, key: data.key, value: val }));
    }

    removeErrors(data.key);
  };

  const multiSelectChange = (...args) => {
    if (data.handleChange) {
      data.handleChange(...args);
    } else {
      dispatch(updateStep({ index: stepIndex, key: data.key, value: args[0] }));
    }

    removeErrors(data.key);
  };

  const error = data.key
    ? task.showError && !data.selected && !task[`${data.key}`]
    : false;

  switch (data.type) {
    case "options":
      // if (!(data.options?.length > 0)) return;
      return (
        <div className={`flex flex-col`}>
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
            selected={data.selected ?? task[`${data.key}`]}
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
          }`}>
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
            value={data.selected || task[`${data.key}`]}
            error={error}
            {...data.additionalProps}
          />
        </div>
      );
    case "multiline":
      return (
        <div
          key={data.key}
          style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <p style={{ marginTop: "10px", fontSize: "13px", color: "#676666" }}>
            <b>{data.label}</b>
          </p>
          <textarea
            className={styles["notes"]}
            rows={4}
            value={data.value ?? data.selected ?? task[`${data.key}`]}
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

    case "multi-select":
      // if (!(data.options?.length > 0)) return;
      return (
        <div key={data.id}>
          <MultiSelectDropdown
            label={data.label}
            options={data.options}
            error={data.error}
            disabled={data.disabled}
            additionalProps={data.additionalProps}
            placeholder={data.placeholder}
            selectedDisplayKey={data.selectedDisplayKey}
            multiSelectChange={multiSelectChange}
            selectedValuesKey={data.selectedValuesKey ?? data.key}
            task={task}
          />
        </div>
      );
    default:
      return;
  }
}
