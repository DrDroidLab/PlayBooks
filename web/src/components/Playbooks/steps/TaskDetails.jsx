/* eslint-disable react-hooks/exhaustive-deps */
import { CircularProgress } from "@mui/material";
import { useLazyGetAssetsQuery } from "../../../store/features/playbook/api/index.ts";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setErrors,
} from "../../../store/features/playbook/playbookSlice.ts";
import OptionRender from "./OptionRender.jsx";
import VariablesBox from "./VariablesBox.jsx";

function TaskDetails({ task, data, stepIndex }) {
  const [triggerGetAssets, { isFetching }] = useLazyGetAssetsQuery();
  const dispatch = useDispatch();
  const prevError = useRef(null);
  const { view } = useSelector(playbookSelector);

  const getAssets = () => {
    triggerGetAssets({
      filter: data.assetFilterQuery,
      stepIndex,
    });
  };

  const setDefaultErrors = () => {
    const errors = {};
    for (let step of data.builder) {
      for (let value of step) {
        if (value.isOptional) continue;
        if (!value.key || value.selected) {
          break;
        }
        errors[value.key] = {
          message: "Please enter a value",
        };
      }
    }

    prevError.current = errors;
    dispatch(setErrors({ index: stepIndex, errors }));
  };

  const removeErrors = (key) => {
    const errors = structuredClone(task.errors ?? {});
    delete errors[key];

    prevError.current = errors;
    dispatch(setErrors({ index: stepIndex, errors }));
  };

  useEffect(() => {
    if (task[data.triggerGetAssetsKey]) {
      getAssets();
    }
  }, [task[data?.triggerGetAssetsKey]]);

  useEffect(() => {
    const errorChanged = prevError.current === task.errors;
    if (
      !task.isPrefetched &&
      task &&
      data.builder &&
      Object.keys(task?.errors ?? {}).length === 0 &&
      !errorChanged
    ) {
      setDefaultErrors();
    }
  }, [task]);

  return (
    <div className="mt-2">
      {data?.builder?.map((step) => (
        <div
          className={`flex gap-2 flex-wrap ${
            view === "builder" ? "flex-col" : "flex-row"
          }`}>
          {step.map((value, index) =>
            value.condition ?? true ? (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: view === "builder" ? "column" : "row",
                  // borderTop: "0.5px solid gray",
                  gap: "10px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  maxWidth: "600px",
                }}>
                <OptionRender
                  data={value}
                  removeErrors={removeErrors}
                  stepIndex={stepIndex}
                  task={task}
                />
              </div>
            ) : (
              <></>
            ),
          )}
          {isFetching && <CircularProgress size={20} />}
        </div>
      ))}
      <VariablesBox />
    </div>
  );
}

export default TaskDetails;
