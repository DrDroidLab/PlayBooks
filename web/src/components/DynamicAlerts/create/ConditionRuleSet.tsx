import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/selectors";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions";

type ConditionRuleSetProps = {
  ruleSetIndex: number;
};

function ConditionRuleSet({ ruleSetIndex }: ConditionRuleSetProps) {
  const { id } = useSelector(additionalStateSelector);
  const { rules, step_rules } = useEdgeConditions(id);

  return <div>ConditionRuleSet</div>;
}

export default ConditionRuleSet;
