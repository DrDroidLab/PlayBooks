import React, { ReactNode } from "react";
import HandleInputRender, {
  HandleInputRenderType,
} from "./HandleInputRender.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";

type CustomInputPropTypes = {
  suffix?: ReactNode;
} & HandleInputRenderType;

function CustomInput(props: CustomInputPropTypes) {
  return (
    <div
      className={`flex ${
        props.type === InputTypes.TEXT_ROW
          ? "flex-row items-center gap-2"
          : "flex-col"
      } w-full`}>
      {props.label && (
        <p
          className="text-xs text-gray-500"
          style={{
            marginTop: props.type === InputTypes.TEXT ? "10px" : "",
          }}>
          <b>{props.label}</b>
        </p>
      )}
      <div className="flex items-center gap-1">
        <HandleInputRender {...props} />
        {props.suffix}
      </div>
    </div>
  );
}

export default CustomInput;
