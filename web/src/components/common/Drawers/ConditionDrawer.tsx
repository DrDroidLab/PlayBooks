import AddCondition from "../../AddCondition/index.tsx";
import AddStepCondition from "../../AddStepCondition/index.tsx";
import AddVariableCondition from "../../AddVariableCondition/index.tsx";
import CommonConditionBottom from "../Conditions/CommonConditionBottom.tsx";
import CommonConditionTop from "../Conditions/CommonConditionTop.tsx";

function ConditionDrawer() {
  return (
    <div className="p-2">
      <CommonConditionTop />
      <AddStepCondition />
      <AddCondition />
      <AddVariableCondition />
      <CommonConditionBottom />
    </div>
  );
}

export default ConditionDrawer;
