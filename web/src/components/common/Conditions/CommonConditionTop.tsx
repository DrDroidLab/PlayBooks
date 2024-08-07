import GlobalRule from "./GlobalRule";
import ParentStepNotConfigured from "./ParentStepNotConfigured";

function CommonConditionTop() {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <ParentStepNotConfigured />
      <GlobalRule />
    </div>
  );
}

export default CommonConditionTop;
