import React from "react";
import CustomInput from "../Inputs/CustomInput";
import { ConditionRule, InputTypes, Task } from "../../types";
import handleTaskTypeLabels from "../../utils/conditionals/handleTaskTypeLabels";
import HandleResultTypeForm from "./HandleResultTypeForm";
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions";
import CustomButton from "../common/CustomButton";
import { Delete } from "@mui/icons-material";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../store/features/playbook/selectors";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";
import { additionalStateSelector } from "../../store/features/drawers/selectors";
import StepConditions from "./StepConditions";

type ConditionProps = {
  i: number;
  condition: ConditionRule;
  taskTypeOptions: Task[];
};

function Condition({ i, condition, taskTypeOptions }: ConditionProps) {
  const { id } = useSelector(additionalStateSelector);
  const isPrefetched = useIsPrefetched();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const tasks = currentPlaybook?.ui_requirement.tasks ?? [];
  const { handleRule, deleteCondition } = useEdgeConditions(id);

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
    <div key={i} className="mt-2 border p-1 rounded-md flex flex-col gap-2">
      <p className="text-xs text-violet-500 font-semibold">Condition-{i + 1}</p>
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

      <StepConditions />
    </div>
  );
}

export default Condition;
