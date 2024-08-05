import { useDispatch, useSelector } from "react-redux";
import CommonConditionTop from "../../common/Conditions/CommonConditionTop";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
import Condition from "../../AddCondition/Condition";
import handleTaskTypeOptions from "../../../utils/conditionals/handleTaskTypeOptions";
import StepConditions from "../../AddStepCondition/StepConditions";
import { useEffect } from "react";
import { setAdditionalState } from "../../../store/features/drawers/drawersSlice";
import ConditionRuleSet from "./ConditionRuleSet";
import CustomButton from "../../common/CustomButton";
import { AddRounded } from "@mui/icons-material";
import { addStepRuleSetForDynamicAlert } from "../../../store/features/playbook/playbookSlice";

function AddCondition() {
  const dispatch = useDispatch();
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const step_relations = currentPlaybook?.step_relations ?? [];
  const parentStep = currentPlaybook?.steps?.[0];
  const relation = step_relations?.[0];
  const condition = relation?.condition;

  const handleAddRuleSet = () => {
    dispatch(addStepRuleSetForDynamicAlert());
  };

  useEffect(() => {
    dispatch(
      setAdditionalState({
        source: parentStep?.id,
        id: relation?.id,
      }),
    );
  }, [relation?.id, parentStep?.id]);

  return (
    <div className="flex flex-col gap-1 border p-2 rounded">
      <p className="font-bold text-violet-500 text-sm">Conditions</p>
      {condition?.rule_sets?.map((_, i) => (
        <ConditionRuleSet ruleSetIndex={i} key={i} />
      ))}
      <CustomButton className="w-fit" onClick={handleAddRuleSet}>
        <AddRounded fontSize="inherit" /> Condition
      </CustomButton>
    </div>
  );
}

export default AddCondition;
