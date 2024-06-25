import ValueComponent from "../../ValueComponent/index.jsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { handleTriggerInput } from "../utils/handleInputs.ts";
import CopyCode from "../../common/CopyCode/index.jsx";

function PagerdutyTriggerForm() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div className="flex flex-col gap-2 items-start max-full rounded">
      <div className="max-w-[415px] flex flex-col gap-2 items-start">
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
      {currentWorkflow.webhook && (
        <div className="flex flex-col gap-2 lg:w-1/2">
          <CopyCode content={currentWorkflow.webhook} language={"curl"} />
          <p className="text-sm p-2 border border-violet-500 bg-violet-50 rounded">
            Add this Webhook URL in your PagerDuty Generic Webhook(V3) page.
          </p>
        </div>
      )}
    </div>
  );
}

export default PagerdutyTriggerForm;
