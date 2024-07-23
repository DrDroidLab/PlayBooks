import { RuleTypesType } from "../types/ruleTypes";

type ValueType = {
  key: string;
  value: any;
};

function handleDefaults(ruleId: RuleTypesType, options: any): ValueType[] {
  const option = options.find((op) => op.id === ruleId);
  const values: ValueType[] = [];

  if (!option || Object.keys(option.defaultValues ?? {}).length === 0)
    return values;

  Object.entries(option.defaultValues!).forEach(([key, value]) => {
    values.push({ key, value });
  });

  return values;
}

export default handleDefaults;
