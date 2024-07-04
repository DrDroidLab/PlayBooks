import React, { useEffect, useState } from "react";
import RadioGroup from "../../common/RadioGroupComponent/index.tsx";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { handleInput } from "../utils/handleInputs.ts";
import { generateSummaryUnsupportedNotifications } from "../../../utils/workflow/generateSummaryUnsupportedNotifications.ts";
import { NotificationOptionTypes } from "../../../utils/notificationOptionTypes.ts";

const radioOptions = [
  {
    label: "Generate a link to execute this playbook",
    value: "default",
    isSmall: true,
  },
  {
    label: "Execute this playbook and publish its summary",
    value: "summary",
    isSmall: true,
  },
];

const unsupportedRadioOptions = [
  {
    label: "Generate a link to execute this playbook",
    value: "default",
    isSmall: true,
  },
];

function SummaryOptions() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [selectedValue, setSelectedValue] = useState(
    currentWorkflow.generateSummary ? "summary" : "default",
  );

  const handleRadioChange = (value) => {
    setSelectedValue(value);
    if (value === "summary") {
      handleInput("generateSummary", true);
    } else {
      handleInput("generateSummary", false);
    }
  };

  useEffect(() => {
    if (
      currentWorkflow.notification === NotificationOptionTypes.PAGERDUTY_NOTES
    ) {
      handleInput("generateSummary", false);
      setSelectedValue("default");
    }
  }, [currentWorkflow.notification]);

  return (
    <div className="mt-2">
      <RadioGroup
        options={
          generateSummaryUnsupportedNotifications.includes(
            currentWorkflow.notification,
          )
            ? unsupportedRadioOptions
            : radioOptions
        }
        onChange={handleRadioChange}
        orientation="vertical"
        checked={selectedValue}
      />
    </div>
  );
}

export default SummaryOptions;
