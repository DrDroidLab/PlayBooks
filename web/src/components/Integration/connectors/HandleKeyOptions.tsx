import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectorSelector,
  setKey,
} from "../../../store/features/integrations/integrationsSlice.ts";
import Checkbox from "../../common/Checkbox/index.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

type HandleKeyOptionsPropTypes = {
  option: any;
  connectorActive: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
};

function HandleKeyOptions({
  option,
  connectorActive,
  value,
  onValueChange,
}: HandleKeyOptionsPropTypes) {
  const dispatch = useDispatch();
  const currentConnector = useSelector(connectorSelector);

  switch (option.display_name) {
    case "Service Account JSON":
    case "PEM":
      return (
        <CustomInput
          inputType={InputTypes.MULTILINE}
          disabled={connectorActive}
          value={value ?? currentConnector[option.key_type]}
          handleChange={(value) => {
            if (onValueChange) {
              onValueChange(value);
              return;
            }
            dispatch(setKey({ key: option.key_type, value }));
          }}
          placeholder={`Enter ${option.display_name}`}
          length={500}
          className="h-40 lg:!max-w-1/2 !max-w-full !w-[300px] text-xs outline-none"
        />
      );
    case "SSL Certificate Authority Data":
      return (
        <CustomInput
          inputType={InputTypes.MULTILINE}
          disabled={connectorActive}
          value={value ?? currentConnector[option.key_type]}
          handleChange={(value) => {
            if (onValueChange) {
              onValueChange(value);
              return;
            }
            dispatch(setKey({ key: option.key_type, value }));
          }}
          placeholder={`Enter ${option.display_name} or enter path to certificate in the next field`}
          length={500}
          className="border rounded-lg h-40 lg:max-w-1/2 max-w-full mr-2 p-2 w-[300px] resize-none text-xs outline-none"
        />
      );
    case "Enable TLS certificate validation":
      return (
        <Checkbox
          label=""
          id="ssl-verify"
          disabled={connectorActive}
          isChecked={
            value
              ? value === "true"
              : currentConnector[option.key_type]?.toString() === "true"
          }
          onChange={() => {
            const currVal = currentConnector[option.key_type];
            if (onValueChange) {
              onValueChange(
                value === "false" || value === "" ? "true" : "false",
              );
              return;
            }
            dispatch(setKey({ key: option.key_type, value: !currVal }));
          }}
        />
      );
    default:
      return (
        <CustomInput
          inputType={InputTypes.TEXT}
          handleChange={(val) => {
            if (onValueChange) {
              onValueChange(val);
              return;
            }
            dispatch(setKey({ key: option.key_type, value: val }));
          }}
          disabled={connectorActive}
          value={value ?? currentConnector[option.key_type]}
          placeholder={option.display_name}
          className="!w-[300px]"
        />
      );
  }
}

export default HandleKeyOptions;
