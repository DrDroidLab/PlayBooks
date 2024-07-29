import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import { useSelector } from "react-redux";
import SlackTriggerForm from "../../triggers/SlackTriggerForm.tsx";
import CopyCode from "../../../common/CopyCode/index.js";
import { WorkflowEntryPointOptions } from "../../../../utils/workflow/types/entryPoint.ts";
import PagerdutyTriggerForm from "../../triggers/PagerdutyTriggerForm.js";

function HandleWorkflowType() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  switch (currentWorkflow.workflowType) {
    case WorkflowEntryPointOptions.SLACK_CHANNEL_ALERT:
      return <SlackTriggerForm />;

    case WorkflowEntryPointOptions.PAGERDUTY_INCIDENT:
      return <PagerdutyTriggerForm />;

    case WorkflowEntryPointOptions.API:
      if (currentWorkflow.curl)
        return (
          <div className="flex flex-col gap-2 lg:w-1/2">
            <CopyCode content={currentWorkflow.curl} language={"curl"} />
            <p className="text-sm p-2 border border-violet-500 bg-violet-50 rounded">
              Convert this curl into any language of your choice using{" "}
              <a
                className="underline text-violet-500"
                href="https://curlconverter.com/"
                target="_blank"
                rel="noreferrer">
                https://curlconverter.com/
              </a>
              .
            </p>
          </div>
        );
      else return <></>;

    default:
      return <></>;
  }
}

export default HandleWorkflowType;
