/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setErrors,
} from "../../../store/features/playbook/playbookSlice.ts";
import OptionRender from "./OptionRender.jsx";
import { InfoOutlined } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { constructBuilder } from "../../../utils/playbooksData.ts";
import { deepEqual } from "../../../utils/deepEqual.ts";

function TaskDetails({ id }) {
  const data = constructBuilder(id);
  const [step, currentStepId] = useCurrentStep(id);
  const dispatch = useDispatch();
  const prevError = useRef(null);
  const { view } = useSelector(playbookSelector);

  const setDefaultErrors = () => {
    const errors = {};
    for (let buildStep of data?.builder) {
      for (let value of buildStep) {
        if (value.isOptional) continue;
        if (!value.key || value.selected) {
          break;
        }
        if (!step[value.key]) {
          errors[value.key] = {
            message: `Invalid value for ${value.label}`,
          };
        }
      }
    }

    prevError.current = errors;
    dispatch(setErrors({ errors, id: currentStepId }));
  };

  const removeErrors = (key) => {
    const errors = structuredClone(step.errors ?? {});
    delete errors[key];

    prevError.current = errors;
    dispatch(setErrors({ errors, id: currentStepId }));
  };

  useEffect(() => {
    const errorChanged = deepEqual(prevError.current, step.errors);
    if (
      !step.isPrefetched &&
      step &&
      data?.builder &&
      Object.keys(step?.errors ?? {}).length === 0 &&
      !errorChanged
    ) {
      setDefaultErrors();
    }
  }, [step]);

  useEffect(() => {
    if (step && data.builder) {
      setDefaultErrors();
    }
  }, [step.taskType, step.source]);

  return (
    <div className="relative mt-2">
      {data?.builder?.map((step, index) => (
        <div
          key={`data-${index}`}
          className={`flex gap-2 flex-wrap ${
            view === "builder" ? "flex-col" : "flex-row"
          }`}>
          {step.map((value, index) =>
            value.condition ?? true ? (
              <div
                key={`data-step-${index}`}
                style={{
                  display: "flex",
                  flexDirection: view === "builder" ? "column" : "row",
                  gap: "10px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  width: "100%",
                  justifyContent: "flex-start",
                  maxWidth: view === "builder" ? "600px" : "",
                }}>
                <OptionRender
                  data={value}
                  removeErrors={removeErrors}
                  id={currentStepId}
                />
              </div>
            ) : (
              <></>
            ),
          )}
        </div>
      ))}
      {step.message && (
        <div className="flex gap-1 items-center my-2 bg-gray-100 rounded p-2 text-sm text-blue-500">
          <InfoOutlined fontSize="small" />
          {step.message}
        </div>
      )}
    </div>
  );
}

export default TaskDetails;
