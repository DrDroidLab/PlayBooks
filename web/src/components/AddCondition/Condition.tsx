import CustomInput from "../Inputs/CustomInput";
import { ConditionRule, InputTypes, Task } from "../../types";
import handleTaskTypeLabels from "../../utils/conditionals/handleTaskTypeLabels";
import HandleResultTypeForm from "./HandleResultTypeForm";
import {
  ResultTypeType,
  ResultTypeTypes,
} from "../../utils/conditionals/resultTypeOptions";
import useIsPrefetched from "../../hooks/playbooks/useIsPrefetched";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../store/features/playbook/selectors";
import useEdgeConditions from "../../hooks/playbooks/useEdgeConditions";
import { additionalStateSelector } from "../../store/features/drawers/selectors";
import DeleteRuleButton from "../common/Conditions/DeleteRuleButton";
import { RuleType } from "../common/Conditions/types";

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
  const { handleRule } = useEdgeConditions(id);

  const handleTaskChange = (id: string, i: number) => {
    const task = tasks?.find((task) => task.id === id);
    if (!task) return;
    handleRule("task.id", id, i, RuleType.RULE);
    handleRule("task.reference_id", task?.reference_id ?? "", i, RuleType.RULE);
    handleRule(
      "type",
      (task?.ui_requirement.resultType ??
        ResultTypeTypes.OTHERS) as ResultTypeType,
      i,
      RuleType.RULE,
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

        <DeleteRuleButton ruleType={RuleType.RULE} ruleIndex={i} />
      </div>
    </div>
  );
}

export default Condition;
