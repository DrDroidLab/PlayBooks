import ValueComponent from "../../ValueComponent/index.jsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { handleTriggerInput } from "../utils/handleInputs.ts";

function PagerdutyTriggerForm() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div className="flex flex-col gap-2 items-start max-w-[415px] rounded">
      <div className="text-sm flex items-center gap-2 justify-between w-full">
        <p className="text-xs">Service Name</p>
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val) => {
            handleTriggerInput("serviceName", val);
          }}
          value={currentWorkflow?.trigger?.serviceName}
          placeHolder={"Enter Service Name"}
          length={300}
          error={currentWorkflow?.errors?.serviceName ?? false}
        />
      </div>
      <div className="text-sm flex items-center gap-2 justify-between w-full">
        <p className="text-xs">Title</p>
        <ValueComponent
          valueType={"STRING"}
          onValueChange={(val) => {
            handleTriggerInput("title", val);
          }}
          value={currentWorkflow?.trigger?.title}
          placeHolder={"Enter Title"}
          length={300}
          error={currentWorkflow?.errors?.title ?? false}
        />
      </div>
    </div>
  );
}

export default PagerdutyTriggerForm;
