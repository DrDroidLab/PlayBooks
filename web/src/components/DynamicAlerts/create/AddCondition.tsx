import { useDispatch, useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
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

  const handleAddRuleSet = () => {
    dispatch(addStepRuleSetForDynamicAlert());
  };

  useEffect(() => {
    dispatch(
      setAdditionalState({
        source: parentStep?.id,
      }),
    );
  }, [parentStep?.id]);

  return (
    <div className="flex flex-col gap-1 border p-2 rounded">
      <p className="font-bold text-violet-500 text-sm">Conditions</p>
      {step_relations?.map((relation, i) => (
        <ConditionRuleSet ruleSetIndex={i} relationId={relation.id} key={i} />
      ))}
      <CustomButton className="w-fit" onClick={handleAddRuleSet}>
        <AddRounded fontSize="inherit" /> Condition
      </CustomButton>
    </div>
  );
}

export default AddCondition;
