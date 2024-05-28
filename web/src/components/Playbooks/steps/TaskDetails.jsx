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
import { InfoOutlined } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { constructBuilder } from "../../../utils/playbooksData.ts";

function TaskDetails() {
  const data = constructBuilder();
  const [step] = useCurrentStep();
  const [triggerGetAssets, { isFetching }] = useLazyGetAssetsQuery();
  const dispatch = useDispatch();
  const prevError = useRef(null);
  const { view } = useSelector(playbookSelector);

  const getAssets = () => {
    triggerGetAssets({
      filter: data?.assetFilterQuery,
    });
  };

  const setDefaultErrors = () => {
    const errors = {};
    for (let step of data?.builder) {
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
    dispatch(setErrors(errors));
  };

  const removeErrors = (key) => {
    const errors = structuredClone(step.errors ?? {});
    delete errors[key];

    prevError.current = errors;
    dispatch(setErrors(errors));
  };

  useEffect(() => {
    if (step[data?.triggerGetAssetsKey]) {
      getAssets();
    }
  }, [step[data?.triggerGetAssetsKey], step.connectorType]);

  useEffect(() => {
    const errorChanged = prevError.current === step.errors;
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

  return (
    <div className="relative mt-2">
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
                  gap: "10px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  width: "100%",
                  justifyContent: "flex-start",
                  maxWidth: view === "builder" ? "600px" : "",
                }}>
                <OptionRender data={value} removeErrors={removeErrors} />
              </div>
            ) : (
              <></>
            ),
          )}
          {isFetching && <CircularProgress size={20} />}
        </div>
      ))}
      {step.message && (
        <div className="flex gap-1 items-center my-2 bg-gray-100 rounded p-2 text-sm text-blue-500">
          <InfoOutlined fontSize="small" />
          {step.message}
        </div>
      )}
      <VariablesBox />
    </div>
  );
}

export default TaskDetails;
