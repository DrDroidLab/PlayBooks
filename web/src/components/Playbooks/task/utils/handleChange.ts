import { InputType, InputTypes } from "../../../../types/inputs/inputTypes.ts";
import { updateCardById } from "../../../../utils/execution/updateCardById.ts";

function handleChangeInput(
  type: InputType,
  key: string,
  currentTaskId: string,
  removeErrors: (key: string) => void,
  handleChange?: Function,
) {
  const handleChangeFunction = (val: string) => {
    if (handleChange) {
      handleChange(val);
    } else {
      updateCardById(key, val, currentTaskId);
    }

    removeErrors(key);
  };

  const handleCompositeChange = (value: string) => {
    const valArr = JSON.parse(value);
    if (handleChange) {
      handleChange(valArr);
    } else {
      updateCardById(key, valArr, currentTaskId);
    }

    removeErrors(key);
  };

  const handleCheckboxChange = (value: boolean) => {
    if (handleChange) {
      handleChange(value);
    } else {
      updateCardById(key, value, currentTaskId);
    }

    removeErrors(key);
  };

  switch (type) {
    case InputTypes.TEXT:
    case InputTypes.MULTILINE:
    case InputTypes.DROPDOWN:
    case InputTypes.WYISWYG:
    case InputTypes.DATE:
    case InputTypes.TYPING_DROPDOWN:
    case InputTypes.TYPING_DROPDOWN_MULTIPLE:
      return handleChangeFunction;
    case InputTypes.CHECKBOX:
      return handleCheckboxChange;
    case InputTypes.COMPOSITE:
    case InputTypes.STRING_ARRAY:
      return handleCompositeChange;
    default:
      return () => null;
  }
}

export default handleChangeInput;
