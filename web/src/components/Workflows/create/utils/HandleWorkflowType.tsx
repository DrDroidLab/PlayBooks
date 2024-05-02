import React from "react";
import { currentWorkflowSelector } from "../../../../store/features/workflow/workflowSlice.ts";
import { useSelector } from "react-redux";
import SlackTriggerForm from "../../triggers/SlackTriggerForm";
import CopyCode from "../../../common/CopyCode/index.jsx";

function HandleWorkflowType() {
  const currentWorkflow = useSelector(currentWorkflowSelector);

  switch (currentWorkflow.workflowType) {
    case "slack":
      return <SlackTriggerForm />;

    case "api-trigger":
      if (currentWorkflow.curl)
        return (
          <CopyCode
            title={"API Trigger curl"}
            subtitle={"You can use this curl to trigger this workflow"}
            content={currentWorkflow.curl}
            language={"curl"}
            help={
              <>
                Convert this curl into any language of your choice using{" "}
                <a
                  className="underline text-violet-500"
                  href="https://curlconverter.com/"
                  target="_blank"
                  rel="noreferrer">
                  https://curlconverter.com/
                </a>
                .
              </>
            }
          />
        );
      else return <></>;

    default:
      return <></>;
  }
}

export default HandleWorkflowType;
