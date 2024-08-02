import { HTMLInputTypeAttribute } from "react";
import { DataType } from "../../types/inputs";

function handleInputType(dataType?: DataType): HTMLInputTypeAttribute {
  switch (dataType) {
    case DataType.STRING:
      return "string";
    case DataType.LONG:
      return "number";
    default:
      return "string";
  }
}

export default handleInputType;
