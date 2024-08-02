import React, { HTMLInputTypeAttribute } from "react";
import { InputType, InputTypes } from "../../types/inputs/inputTypes.ts";
import Text from "./InputTypes/Text.tsx";
import Multiline from "./InputTypes/Multiline.tsx";
import CustomButton from "../common/CustomButton/index.tsx";
import IframeRender from "../Playbooks/options/IframeRender.tsx";
import TypingDropdownInput from "./InputTypes/TypingDropdownInput.tsx";
import TypingDropdownMultipleInput from "./InputTypes/TypingDropdownMultipleInput.tsx";
import DropdownInput from "./InputTypes/DropdownInput.tsx";
import Wysiwyg from "./InputTypes/Wysiwyg.tsx";
import CompositeField from "./InputTypes/CompositeField.tsx";
import DateInput from "./InputTypes/Date.tsx";
import StringArrayInput from "./InputTypes/StringArrayInput.tsx";
import TypingDropdownMultipleSelectionInput from "./InputTypes/TypingDropdownMultipleSelectionInput.tsx";
import TextButton from "./InputTypes/TextButton.tsx";

export type HandleInputRenderType = {
  inputType: InputType;
  value: any;
  type?: HTMLInputTypeAttribute;
  label?: string;
  handleChange?: (val: string) => void;
  handleClick?: React.MouseEventHandler<HTMLButtonElement>;
  handleAddClick?: () => void;
  error?: string;
  disabled?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: any[];
  searchable?: boolean;
  length?: number;
  className?: string;
  compositeFields?: HandleInputRenderType[];
  key?: string;
  isOptional?: boolean;
  default?: string;
  format?: string;
  disabledDate?: (date: Date) => boolean;
  typingContainerClassname?: string;
  buttonText?: string;
  buttonClickValue?: string;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLButtonElement>;

function HandleInputRender({ inputType, ...props }: HandleInputRenderType) {
  switch (inputType) {
    case InputTypes.TEXT:
      return <Text {...props} handleChange={props.handleChange!} />;
    case InputTypes.MULTILINE:
      return <Multiline handleChange={props.handleChange!} {...props} />;
    case InputTypes.BUTTON:
      return (
        <CustomButton onClick={props.handleClick!}>{props.label}</CustomButton>
      );
    case InputTypes.IFRAME_RENDER:
      return <IframeRender url={props.value} />;
    case InputTypes.DROPDOWN:
      return (
        <DropdownInput
          {...props}
          handleChange={props.handleChange!}
          options={props.options ?? []}
        />
      );
    case InputTypes.TYPING_DROPDOWN:
      return (
        <TypingDropdownInput
          {...props}
          handleChange={props.handleChange!}
          options={props.options ?? []}
        />
      );
    case InputTypes.TYPING_DROPDOWN_MULTIPLE:
      return (
        <TypingDropdownMultipleInput
          {...props}
          handleChange={props.handleChange!}
          options={props.options ?? []}
          handleAddClick={props.handleAddClick!}
        />
      );
    case InputTypes.WYISWYG:
      return <Wysiwyg handleChange={props.handleChange!} {...props} />;
    case InputTypes.COMPOSITE:
      return <CompositeField handleChange={props.handleChange} {...props} />;
    case InputTypes.DATE:
      return <DateInput handleChange={props.handleChange!} {...props} />;
    case InputTypes.STRING_ARRAY:
      return <StringArrayInput handleChange={props.handleChange!} {...props} />;
    case InputTypes.TYPING_DROPDOWN_MULTIPLE_SELECTION:
      return (
        <TypingDropdownMultipleSelectionInput
          handleChange={props.handleChange!}
          {...props}
        />
      );
    case InputTypes.TEXT_BUTTON:
      return (
        <TextButton
          {...props}
          handleChange={props.handleChange!}
          buttonText={props.buttonText!}
          buttonClickValue={props.buttonClickValue!}
        />
      );
    default:
      return <p className="text-xs font-semibold">Unsupported Input Type</p>;
  }
}

export default HandleInputRender;
