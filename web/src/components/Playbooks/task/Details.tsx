/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setErrors } from "../../../store/features/playbook/playbookSlice.ts";
import { constructBuilder } from "../../../utils/playbook/constructBuilder.ts";
import { deepEqual } from "../../../utils/common/deepEqual.ts";
import OptionRender from "./OptionRender.tsx";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import getNestedValue from "../../../utils/common/getNestedValue.ts";

function Details({ id }) {
  const data: any = constructBuilder(id);
  const [task, currentTaskId] = useCurrentTask(id);
  const dispatch = useDispatch();
  const prevError = useRef<any>(null);

  const setDefaultErrors = () => {
    const errors = {};
    for (let value of data) {
      if (value.isOptional) continue;
      if (!value.key || value.selected) {
        break;
      }
      if (!getNestedValue(task, value.key)) {
        errors[value.key] = {
          message: `Invalid value for ${value.label}`,
        };
      }
    }

    prevError.current = errors;
    dispatch(setErrors({ errors, id: currentTaskId }));
  };

  const removeErrors = (key) => {
    const errors = structuredClone(task?.ui_requirement?.errors ?? {});
    delete errors[key];

    prevError.current = errors;
    dispatch(setErrors({ errors, id: currentTaskId }));
  };

  useEffect(() => {
    const errorChanged = deepEqual(
      prevError.current,
      task?.ui_requirement.errors,
    );
    if (
      task &&
      data &&
      Object.keys(task.ui_requirement?.errors ?? {}).length === 0 &&
      !errorChanged
    ) {
      setDefaultErrors();
    }
  }, [task]);

  useEffect(() => {
    if (task && data) {
      setDefaultErrors();
    }
  }, [task?.[task?.source?.toLowerCase() ?? ""]?.type, task?.source]);

  return (
    <div className="relative mt-2 flex flex-col gap-2">
      {data?.map((value, index) => (
        <div key={`data-${index}`} className={`flex gap-2 flex-wrap flex-col`}>
          <div
            key={`data-step-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              width: "100%",
              justifyContent: "flex-start",
              maxWidth: "600px",
            }}>
            <OptionRender
              data={value}
              removeErrors={removeErrors}
              id={currentTaskId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Details;
