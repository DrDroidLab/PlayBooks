/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import SelectComponent from "../../SelectComponent";
import styles from "./index.module.css";
import { useDispatch } from "react-redux";
import { setSelectedGrafanaOptions } from "../../../store/features/playbook/playbookSlice.ts";
import ValueComponent from "../../ValueComponent";
import { setGrafanaOptionsFunction } from "../../../utils/setGrafanaOptionsFunction.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function VariablesBox() {
  const [step, currentStepIndex] = useCurrentStep();
  const dispatch = useDispatch();
  const handleVariableChange = (_, val) => {
    if (val)
      dispatch(
        setSelectedGrafanaOptions({ index: currentStepIndex, option: val }),
      );
  };

  useEffect(() => {
    if (step.grafanaQuery && step.assets) {
      setGrafanaOptionsFunction(currentStepIndex);
    }
  }, [step.assets]);

  return (
    <div className={styles["variables-box"]}>
      {step?.options && step?.options?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexDirection: "row" }}>
          <p style={{ fontSize: "12px", color: "darkgray", marginTop: "5px" }}>
            Variables
          </p>
          {step?.options?.map((option, i) => {
            return (
              <div
                key={currentStepIndex}
                style={{ display: "flex", gap: "5px" }}>
                {option?.values?.length > 0 ? (
                  <SelectComponent
                    data={option?.values.map((e, i) => {
                      return {
                        id: e,
                        label: e,
                        option,
                      };
                    })}
                    placeholder={`Select ${option?.label?.label}`}
                    onSelectionChange={handleVariableChange}
                    selected={
                      step?.selectedOptions
                        ? step?.selectedOptions[option?.variable]
                        : ""
                    }
                    searchable={true}
                  />
                ) : (
                  <ValueComponent
                    placeHolder={`Enter ${option?.variable}`}
                    valueType={"STRING"}
                    onValueChange={(val) =>
                      handleVariableChange({
                        id: val,
                        label: option.variable,
                      })
                    }
                    value={
                      step?.selectedOptions
                        ? step?.selectedOptions[option?.variable]
                        : ""
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VariablesBox;
