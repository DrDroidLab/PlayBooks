import React, { ReactNode } from "react";
import HandleInputRender, {
  HandleInputRenderType,
} from "./HandleInputRender.tsx";
import { LabelPosition } from "../../types/inputs/labelPosition.ts";
import * as InputUtils from "./utils/index.ts";

type CustomInputPropTypes = {
  suffix?: ReactNode;
  labelPosition?: LabelPosition;
  containerClassName?: string;
  helpTextSide?: string;
} & HandleInputRenderType;

function CustomInput({
  labelPosition = LabelPosition.TOP,
  containerClassName = "",
  helpTextSide,
  ...props
}: CustomInputPropTypes) {
  return (
    <div
      className={`${InputUtils.handleLabelPositionClassname(
        labelPosition,
      )} ${InputUtils.handleInputTypeClassname(
        props.inputType,
      )} ${containerClassName} gap-1 w-fit`}>
      {props.label && (
        <p className="text-xs text-gray-500">
          <b>{props.label}</b>
        </p>
      )}
      <div className="flex items-center gap-1">
        <HandleInputRender {...props} />
        {props.suffix}
      </div>
      {helpTextSide && (
        <p className="text-xs text-gray-500 italic">{helpTextSide}</p>
      )}
    </div>
  );
}

export default CustomInput;
