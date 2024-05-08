/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import SelectComponent from "../../SelectComponent";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setSelectedGrafanaOptions,
} from "../../../store/features/playbook/playbookSlice.ts";
import ValueComponent from "../../ValueComponent";
import { setGrafanaOptionsFunction } from "../../../utils/setGrafanaOptionsFunction.ts";

function VariablesBox({ task }) {
  const { currentStepIndex } = useSelector(playbookSelector);
  const dispatch = useDispatch();
  const handleVariableChange = (_, val) => {
    if (val)
      dispatch(
        setSelectedGrafanaOptions({ index: currentStepIndex, option: val }),
      );
  };

  useEffect(() => {
    if (task.grafanaQuery && task.assets) {
      setGrafanaOptionsFunction(currentStepIndex);
    }
  }, [task.assets]);

  return (
    <div className={styles["variables-box"]}>
      {task?.options && task?.options?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexDirection: "row" }}>
          <p style={{ fontSize: "12px", color: "darkgray", marginTop: "5px" }}>
            Variables
          </p>
          {task?.options?.map((option, i) => {
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
                      task?.selectedOptions
                        ? task?.selectedOptions[option?.variable]
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
                      task?.selectedOptions
                        ? task?.selectedOptions[option?.variable]
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
