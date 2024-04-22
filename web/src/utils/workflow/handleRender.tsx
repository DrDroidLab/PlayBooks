import React from "react";
import ValueComponent from "../../components/ValueComponent";
import SelectComponent from "../../components/SelectComponent";
import { handleCheckbox, handleInput } from "./handleInputs.ts";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../store/features/workflow/workflowSlice.ts";

export const HandleRender = ({ option }) => {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  switch (option.type) {
    case "string":
      return (
        <div key={option.id}>
          <label
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            {option.label}
          </label>
          <ValueComponent
            valueType={"STRING"}
            placeHolder={option.placeholder || `Enter ${option.label}`}
            value={currentWorkflow[option.id]}
            onValueChange={(val) => handleInput(option.id, val)}
            {...option.additionalProps}
          />
        </div>
      );

    case "dropdown":
      return (
        <div key={option.id}>
          <label
            className="text-xs flex-wrap font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            {option.label}
          </label>
          <SelectComponent
            data={option.options}
            placeholder={option.placeholder || `Select ${option.label}`}
            onSelectionChange={(val) => handleInput(option.id, val)}
            selected={currentWorkflow[option.id]}
            {...option.additionalProps}
          />
        </div>
      );

    case "checkbox":
      return (
        <div key={option.id}>
          <div className="flex gap-2">
            <input
              id={option.id}
              type="checkbox"
              className="cursor-pointer"
              name={`checkbox-${option.group}`}
              checked={currentWorkflow[option.id]}
              data-key={option.id}
              onChange={handleCheckbox}
            />
            <label htmlFor={option.id} className="text-sm cursor-pointer">
              {option.label}
            </label>
          </div>
          {currentWorkflow[option.id] &&
            option.options?.map((op) => <HandleRender option={op} />)}
        </div>
      );

    case "multiple-checkbox":
      return (
        <div key={option.id} className="my-2">
          {option.options.map((option) => (
            <HandleRender option={option} />
          ))}
        </div>
      );

    case "multi":
      return (
        <div className="my-2" key={option.id}>
          <label
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="playbook">
            {option.label}
          </label>
          <div className="flex gap-2 items-center">
            {option.options.map((option) => (
              <HandleRender option={option} />
            ))}
          </div>
        </div>
      );
    default:
      return <></>;
  }
};
