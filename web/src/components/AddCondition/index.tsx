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
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions.ts";
import { extractSource } from "../../utils/extractData.ts";
import SavePlaybookButton from "../Buttons/SavePlaybookButton/index.tsx";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";

function AddCondition() {
  const { source, id } = useSelector(additionalStateSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const {
    playbookEdges,
    rules,
    condition,
    handleRule,
    addNewRule,
    deleteCondition,
    handleGlobalRule,
  } = useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);

  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  useEffect(() => {
    if (rules?.length === 0) {
      handleRule("", "", 0);
    }
  }, [rules, handleRule, playbookEdges]);

  const task = tasks?.find((e) => e.id === rules?.[0]?.task);

  return (
    <div className="p-2">
      <h1 className="text-violet-500 font-semibold text-lg flex justify-between my-2">
        <span>Add Condition</span>
      </h1>
      <hr />

      {taskTypeOptions.length === 0 && (
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
          selected={condition?.logical_opertaor}
          placeholder={`Select Global Rule`}
          onSelectionChange={handleGlobalRule}
        />
      </div>

      {rules?.map((condition, i) => (
        <div className="mt-2 border p-1 rounded-md">
          <p className="text-xs text-violet-500 font-semibold">
            Condition-{i + 1}
          </p>
          <div className="flex flex-col gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <SelectComponent
                data={taskTypeOptions.map((task) => ({
                  id: task?.id,
                  label: task?.description,
                }))}
                selected={condition.task}
                placeholder={`Select Task`}
                onSelectionChange={(id: string) => handleRule("task", id, i)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <HandleResultTypeForm
                resultType={
                  (tasks?.find((task) => task.id === condition.task)
                    ?.ui_requirement.resultType ??
                    ResultTypeTypes.OTHERS) as ResultTypeType
                }
                condition={condition}
                conditionIndex={i}
              />
            </div>

            {i !== 0 && (
              <div className="flex gap-2 flex-wrap">
                <CustomButton
                  className="!text-sm !w-fit"
                  onClick={() => deleteCondition(i)}>
                  <Delete fontSize="inherit" />
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      ))}

      <CustomButton className="!text-sm !w-fit my-2" onClick={addNewRule}>
        <Add fontSize="inherit" /> Add
      </CustomButton>

      <SavePlaybookButton shouldNavigate={false} />
    </div>
  );
}

export default AddCondition;
