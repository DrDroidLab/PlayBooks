import { SearchOptionTypes, SearchOptionTypesType } from "./optionTypes.ts";

function handleOptionType(option: any): any {
  const type: SearchOptionTypesType = option.type;
  const optionValue = option[type.toLowerCase()];

  switch (type) {
    case SearchOptionTypes.ID:
      return {
        type: "LONG",
        long: optionValue.long,
      };
    default:
      return {
        type: option.type,
        [option.type?.toLowerCase()]: optionValue,
      };
  }
}

export default handleOptionType;
