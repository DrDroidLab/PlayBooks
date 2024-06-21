import { OptionType } from "../playbooksData.ts";
import { updateCardById } from "../execution/updateCardById.ts";

export const datadogRawQueryBuilder = (task, id: string) => {
  return {
    builder: [
      [
        {
          key: "query1",
          label: "a",
          type: OptionType.TEXT_ROW,
          additionalProps: {
            length: 400,
          },
        },
        {
          key: "requiresFormula",
          isOptional: true,
          label: task.requiresFormula ? "- Query" : "+ Query",
          type: OptionType.BUTTON,
          selected: task.requiresFormula,
          handleClick: () => {
            updateCardById("requiresFormula", !task.requiresFormula, id);
          },
          additionalProps: {
            length: 400,
          },
        },
      ],
      [
        {
          key: "query2",
          label: "b",
          isOptional: true,
          type: OptionType.TEXT_ROW,
          additionalProps: {
            length: 400,
          },
          condition: task.requiresFormula === true,
        },
      ],
      [
        {
          key: "formula",
          label: "Formula",
          isOptional: true,
          type: OptionType.TEXT_ROW,
          placeholder: "Enter Formula, eg: a+b",
          additionalProps: {
            length: 400,
          },
          condition: task.requiresFormula === true,
        },
      ],
    ],
  };
};
