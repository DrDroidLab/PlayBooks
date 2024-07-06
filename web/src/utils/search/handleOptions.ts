import { SearchOptionTypes, SearchOptionTypesType } from "./optionTypes.ts";

type SearchOptionType = {
  id: string;
  label: string;
  option: any;
};

function handleOptions(column: any, option: any): SearchOptionType[] {
  const type: SearchOptionTypesType = column.type;
  const optionValue = option[type.toLowerCase()];
  const values: string[] = [];

  switch (type) {
    case SearchOptionTypes.ID:
      values.push(optionValue.alias);
      break;
    case SearchOptionTypes.STRING:
      values.push(optionValue);
      break;
    case SearchOptionTypes.STRING_ARRAY:
      values.push(...optionValue);
      break;
    default:
      values.push(optionValue.toString());
  }

  if (values.length > 0) {
    return values.map((val) => ({
      label: `${column.name}: ${val}`,
      id: `${column.name}: ${val}`,
      option,
      column,
    }));
  } else {
    return [];
  }
}

export default handleOptions;
