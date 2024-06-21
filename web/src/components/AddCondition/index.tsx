import React, { useEffect } from "react";
import SelectComponent from "../SelectComponent/index.jsx";
import useCurrentStep from "../../hooks/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add, Delete, ErrorOutlineRounded } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/useEdgeConditions.ts";
import { ruleOptions } from "../../utils/conditionals/ruleOptions.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import HandleResultTypeForm from "./HandleResultTypeForm.tsx";
import { ResultTypeType } from "../../utils/conditionals/resultTypeOptions.ts";
import extractSource from "../../utils/extractSource.ts";

function AddCondition() {
  const { source, id } = useSelector(additionalStateSelector);
  const {
    playbookEdges,
    conditions,
    globalRule,
    handleCondition,
    addNewCondition,
    deleteCondition,
    handleGlobalRule,
  } = useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);

  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  useEffect(() => {
    if (conditions?.length === 0) {
      handleCondition("", "", 0);
    }
  }, [conditions, handleCondition, playbookEdges]);

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-lg flex justify-between my-2">
        <span>Add Condition</span>
      </h1>
      <hr />

      {(Object.keys(parentStep?.errors ?? {}).length > 0 ||
        taskTypeOptions.length === 0) && (
        <div className="bg-red-50 p-2 flex items-center gap-1 my-1 rounded flex-wrap">
          <ErrorOutlineRounded
            color="error"
            component={"svg"}
            fontSize="inherit"
          />
          <p className="text-xs">
            You have not configured the parent step yet.
          </p>
        </div>
      )}

      <div className="flex flex-col items-start gap-1 mt-4">
        <p className="text-xs text-violet-500 font-semibold">
          Select a global rule
        </p>
        <SelectComponent
          data={ruleOptions}
          selected={globalRule}
          placeholder={`Select Global Rule`}
          onSelectionChange={handleGlobalRule}
        />
      </div>

      {conditions?.map((condition, i) => (
        <div className="mt-2 border p-1 rounded-md">
          <p className="text-xs text-violet-500 font-semibold">
            Condition-{i + 1}
          </p>
          <div className="flex flex-col gap-2 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <HandleResultTypeForm
                resultType={parentStep.resultType as ResultTypeType}
                condition={condition}
                conditionIndex={i}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <CustomButton
                className="!text-sm !w-fit"
                onClick={() => deleteCondition(i)}>
                <Delete fontSize="inherit" />
              </CustomButton>
            </div>
          </div>
        </div>
      ))}

      <CustomButton className="!text-sm !w-fit my-2" onClick={addNewCondition}>
        <Add fontSize="inherit" /> Add
      </CustomButton>
    </div>
  );
}

export default AddCondition;
