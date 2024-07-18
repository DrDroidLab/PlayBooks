import { updateCardById } from "../execution/updateCardById.ts";
import { Key } from "../playbook/key.ts";
import { Task } from "../../types/index.ts";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";

const getTaskUiRequirements = (task: Task) => {
  return task.ui_requirement;
};

export const datadogRawQueryBuilder = (task: Task, id: string) => {
  return {
    builder: [
      [
        {
          key: Key.QUERY1,
          label: "a",
          type: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
          length: 400,
        },
        {
          isOptional: true,
          label: getTaskUiRequirements(task)?.requiresFormula
            ? "- Query"
            : "+ Query",
          type: InputTypes.BUTTON,
          selected: getTaskUiRequirements(task)?.requiresFormula,
          handleClick: () => {
            updateCardById(
              "ui_requirement.requiresFormula",
              !getTaskUiRequirements(task)?.requiresFormula,
              id,
            );
          },
          length: 400,
        },
      ],
      [
        {
          key: Key.QUERY2,
          label: "b",
          isOptional: true,
          type: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
          length: 400,
          condition: getTaskUiRequirements(task)?.requiresFormula === true,
        },
      ],
      [
        {
          key: Key.FORMULA,
          label: "Formula",
          isOptional: true,
          type: InputTypes.TEXT,
          labelPosition: LabelPosition.LEFT,
          placeholder: "Enter Formula, eg: a+b",
          length: 400,
          condition: getTaskUiRequirements(task)?.requiresFormula === true,
        },
      ],
    ],
  };
};
