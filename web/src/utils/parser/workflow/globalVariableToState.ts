import { GlobalVariableSet } from "../../../types/globalVariableSet.ts";

export default function globalVariableToState(global_variable_set) {
  return Object.entries(global_variable_set ?? {}).map(
    (val): GlobalVariableSet => {
      return {
        name: val[0],
        value: val[1] as string,
      };
    },
  );
}
