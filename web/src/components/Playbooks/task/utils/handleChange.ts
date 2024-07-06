import { InputType, InputTypes } from "../../../../types/inputs/inputTypes.ts";
import { updateCardById } from "../../../../utils/execution/updateCardById.ts";

function handleChangeInput(
  type: InputType,
  key: string,
  currentTaskId: string,
  removeErrors: (key: string) => void,
  handleChange?: Function,
  handleKeyChange?: (key: string) => void,
) {
  const handleChangeFunction = (val: string) => {
    if (handleChange) {
      handleChange(val);
    } else {
      updateCardById(key, val, currentTaskId);
    }

    removeErrors(key);
  };

  const handleTypingDropdownChange = (value, option) => {
    if (handleChange && option) {
      handleChange(value, option);
    } else if (handleKeyChange) {
      handleKeyChange(value);
    } else {
      updateCardById(key, value, currentTaskId);
    }

    removeErrors(key);
  };

  switch (type) {
    case InputTypes.TEXT:
    case InputTypes.TEXT_ROW:
    case InputTypes.MULTILINE:
      return handleChangeFunction;
    case InputTypes.TYPING_DROPDOWN:
      return handleTypingDropdownChange;
    default:
      return () => null;
  }
}

export default handleChangeInput;
