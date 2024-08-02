import GlobalRule from "./GlobalRule";
import ParentStepNotConfigured from "./ParentStepNotConfigured";

function CommonConditionTop() {
  return (
    <div className="m-2">
      <ParentStepNotConfigured />
      <GlobalRule />
    </div>
  );
}

export default CommonConditionTop;
