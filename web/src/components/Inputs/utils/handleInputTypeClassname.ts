import { InputType, InputTypes } from "../../../types/inputs/index.ts";

export const handleInputTypeClassname = (type: InputType) => {
  switch (type) {
    case InputTypes.IFRAME_RENDER:
    case InputTypes.MULTILINE:
    case InputTypes.TYPING_DROPDOWN_MULTIPLE_SELECTION:
      return "w-full";
    default:
      return "";
  }
};
