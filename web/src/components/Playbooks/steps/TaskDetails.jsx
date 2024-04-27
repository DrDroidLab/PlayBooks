/* eslint-disable react-hooks/exhaustive-deps */
import { CircularProgress } from "@mui/material";
import { useLazyGetAssetsQuery } from "../../../store/features/playbook/api/index.ts";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setErrors } from "../../../store/features/playbook/playbookSlice.ts";
import OptionRender from "./OptionRender.jsx";
import VariablesBox from "./VariablesBox.jsx";

function TaskDetails({ task, data, stepIndex }) {
  const [triggerGetAssets, { isFetching }] = useLazyGetAssetsQuery();
  const dispatch = useDispatch();
  const prevError = useRef(null);

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
    <>
      {data?.builder?.map((step, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "10px",
            paddingTop: "20px",
            borderTop: "0.5px solid gray",
            gap: "10px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}>
          {step.map((value) => {
            let flag = true;
            for (let val of value?.requires ?? []) {
              if (!task[val]) {
                flag = false;
                break;
              }
            }

            if (flag)
              return (
                <OptionRender
                  data={value}
                  removeErrors={removeErrors}
                  stepIndex={stepIndex}
                  task={task}
                />
              );
            else return <></>;
          })}
          {isFetching && <CircularProgress size={20} />}
        </div>
      ))}
      <VariablesBox />
    </>
  );
}

export default TaskDetails;
