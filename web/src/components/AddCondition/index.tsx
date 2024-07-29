import useCurrentStep from "../../hooks/playbooks/step/useCurrentStep.ts";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../store/features/drawers/drawersSlice.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import { Add, Delete, ErrorOutlineRounded } from "@mui/icons-material";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions.ts";
import { ruleOptions } from "../../utils/conditionals/ruleOptions.ts";
import handleTaskTypeOptions from "../../utils/conditionals/handleTaskTypeOptions.ts";
import HandleResultTypeForm from "./HandleResultTypeForm.tsx";
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions.ts";
import { extractSource } from "../../utils/playbook/extractData.ts";
import SavePlaybookButton from "../Buttons/SavePlaybookButton/index.tsx";
import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import handleTaskTypeLabels from "../../utils/conditionals/handleTaskTypeLabels.ts";
import CustomInput from "../Inputs/CustomInput.tsx";
import { InputTypes } from "../../types/inputs/inputTypes.ts";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched.ts";

function AddCondition() {
  const { source, id } = useSelector(additionalStateSelector);
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const {
    rules,
    condition,
    handleRule,
    addNewRule,
    deleteCondition,
    handleGlobalRule,
  } = useEdgeConditions(id);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);
  const isPrefetched = useIsPrefetched();

  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  const handleTaskChange = (id: string, i: number) => {
    const task = tasks?.find((task) => task.id === id);
    if (!task) return;
    handleRule("task.id", id, i);
    handleRule("task.reference_id", task?.reference_id ?? "", i);
    handleRule(
      "type",
      (task?.ui_requirement.resultType ??
        ResultTypeTypes.OTHERS) as ResultTypeType,
      i,
    );
  };

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
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={ruleOptions}
          value={condition?.logical_operator ?? ""}
          placeholder={`Select Global Rule`}
          handleChange={handleGlobalRule}
          error={undefined}
          disabled={!!isPrefetched}
        />
      </div>

      {rules?.map((condition, i) => (
        <div key={i} className="mt-2 border p-1 rounded-md">
          <p className="text-xs text-violet-500 font-semibold">
            Condition-{i + 1}
          </p>
          <div className="flex flex-col gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <CustomInput
                inputType={InputTypes.DROPDOWN}
                error={undefined}
                options={taskTypeOptions?.map((task) => ({
                  id: task?.id,
                  label: handleTaskTypeLabels(task).label,
                }))}
                value={condition?.task?.id ?? ""}
                placeholder={`Select Task`}
                handleChange={(id: string) => handleTaskChange(id, i)}
                disabled={!!isPrefetched}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <HandleResultTypeForm
                resultType={
                  (tasks?.find((task) => task.id === condition?.task?.id)
                    ?.ui_requirement.resultType ??
                    ResultTypeTypes.OTHERS) as ResultTypeType
                }
                condition={condition}
                conditionIndex={i}
              />
            </div>

            {!isPrefetched && (
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

      {!isPrefetched && (
        <>
          <CustomButton className="!text-sm !w-fit my-2" onClick={addNewRule}>
            <Add fontSize="inherit" /> Add
          </CustomButton>

          <SavePlaybookButton shouldNavigate={false} />
        </>
      )}
    </div>
  );
}

export default AddCondition;
