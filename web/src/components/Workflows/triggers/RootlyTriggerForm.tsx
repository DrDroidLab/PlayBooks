import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { handleTriggerInput } from "../utils/handleInputs.ts";
import CopyCode from "../../common/CopyCode/index.js";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";

function RootlyTriggerForm() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  return (
    <div className="flex flex-col gap-2 items-start max-full rounded bg-gray-50 p-2">
      {currentWorkflow.webhook && (
        <div className="flex flex-col gap-2 lg:w-1/2">
          <p className="text-sm p-2 border border-violet-500 bg-violet-50 rounded">
            Add these Webhook details in your Rootly HTTP Client in your
            incident workflow. Read more about this{" "}
            <a
              href="https://docs.drdroid.io/docs/rootly-trigger"
              target="_blank"
              className="text-violet-500 hover:underline"
              rel="noreferrer">
              here
            </a>
          </p>
          <CopyCode content={currentWorkflow.webhook} language={"curl"} />
        </div>
      )}
      <div className="max-w-[415px] flex flex-col gap-2 items-start">
        <div className="text-sm flex items-center gap-2 w-full">
          <p className="text-sm">Filters</p>
          <p className="text-gray-500 text-xs italic">
            (Enter incident title to select incidents)
          </p>
        </div>
        <div className="text-sm flex items-center gap-2 justify-between w-full">
          <p className="text-xs">Title</p>
          <CustomInput
            inputType={InputTypes.TEXT}
            handleChange={(val) => {
              handleTriggerInput("title", val);
            }}
            value={currentWorkflow?.trigger?.title}
            placeholder={"Enter Title"}
            className="!w-[300px]"
            error={currentWorkflow?.errors?.title ?? false}
          />
        </div>
      </div>
    </div>
  );
}

export default RootlyTriggerForm;
