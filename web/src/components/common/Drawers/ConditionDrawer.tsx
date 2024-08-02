import AddCondition from "../../AddCondition/index.tsx";
import AddStepCondition from "../../AddStepCondition/index.tsx";
import CommonConditionBottom from "../Conditions/CommonConditionBottom.tsx";
import CommonConditionTop from "../Conditions/CommonConditionTop.tsx";

function ConditionDrawer() {
  return (
    <>
      <CommonConditionTop />
      <AddCondition />
      <AddStepCondition />
      <CommonConditionBottom />
    </>
  );
}

export default ConditionDrawer;
