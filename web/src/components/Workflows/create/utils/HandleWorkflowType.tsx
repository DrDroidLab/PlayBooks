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
        return <CopyCode content={currentWorkflow.curl} language={"curl"} />;
      else return <></>;

    default:
      return <></>;
  }
}

export default HandleWorkflowType;
