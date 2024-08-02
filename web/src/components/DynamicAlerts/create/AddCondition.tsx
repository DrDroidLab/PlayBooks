import { useDispatch, useSelector } from "react-redux";
import CommonConditionTop from "../../common/Conditions/CommonConditionTop";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
import Condition from "../../AddCondition/Condition";
import handleTaskTypeOptions from "../../../utils/conditionals/handleTaskTypeOptions";
import StepConditions from "../../AddStepCondition/StepConditions";
import { useEffect } from "react";
import { setAdditionalState } from "../../../store/features/drawers/drawersSlice";

function AddCondition() {
  const dispatch = useDispatch();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const step_relations = currentPlaybook?.step_relations ?? [];
  const parentStep = currentPlaybook?.steps?.[0];

  const taskTypeOptions = handleTaskTypeOptions(parentStep);
  const relation = step_relations?.[0];
  const condition = relation?.condition;

  useEffect(() => {
    dispatch(
      setAdditionalState({
        source: parentStep?.id,
        id: relation?.id,
      }),
    );
  }, [relation?.id, parentStep?.id]);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Conditions</p>
      <CommonConditionTop />

      {condition?.rules?.map((condition, i) => (
        <Condition
          key={i}
          i={i}
          condition={condition}
          taskTypeOptions={taskTypeOptions}
          showDelete={false}
        />
      ))}
      {condition?.step_rules?.map((rule, i) => (
        <StepConditions rule={rule} ruleIndex={i} showDelete={false} />
      ))}
    </div>
  );
}

export default AddCondition;
