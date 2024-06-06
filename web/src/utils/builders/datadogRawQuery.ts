import { store } from "../../store/index.ts";
import { setRequiresFormula } from "../../store/features/playbook/playbookSlice.ts";
import { OptionType } from "../playbooksData.ts";

export const datadogRawQueryBuilder = (task, index) => {
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
            store.dispatch(
              setRequiresFormula({
                index,
                requiresFormula: !task.requiresFormula,
              }),
            );
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
