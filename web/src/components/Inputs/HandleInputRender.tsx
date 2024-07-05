import React from "react";
import { InputType, InputTypes } from "../../types/inputs/inputTypes.ts";
import Text from "./InputTypes/Text.tsx";
import Multiline from "./InputTypes/Multiline.tsx";
import CustomButton from "../common/CustomButton/index.tsx";
import IframeRender from "../Playbooks/options/IframeRender.tsx";
import TypingDropdownInput from "./InputTypes/TypingDropdownInput.tsx";

type HandleInputRenderType = {
  type: InputType;
  label: string;
  value: string;
  handleChange?: (val: string) => void;
  handleClick?: React.MouseEventHandler<HTMLButtonElement>;
  error?: string;
  disabled?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: any[];
};

function HandleInputRender({ type, ...props }: HandleInputRenderType) {
  switch (type) {
    case InputTypes.TEXT_ROW:
    case InputTypes.TEXT:
      return <Text {...props} handleChange={props.handleChange!} type={type} />;

    case InputTypes.MULTILINE:
      return <Multiline handleChange={props.handleChange!} {...props} />;

    case InputTypes.BUTTON:
      return (
        <CustomButton onClick={props.handleClick!} {...props}>
          {props.label}
        </CustomButton>
      );

    case InputTypes.IFRAME_RENDER:
      return <IframeRender url={props.value} />;

    case InputTypes.TYPING_DROPDOWN:
      return (
        <TypingDropdownInput
          {...props}
          handleChange={props.handleChange!}
          options={props.options ?? []}
        />
      );
    default:
      return <p className="text-xs font-semibold">Unsupported Input Type</p>;
  }
}

export default HandleInputRender;
