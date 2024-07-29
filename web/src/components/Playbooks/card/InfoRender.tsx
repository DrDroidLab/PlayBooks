import React from "react";
import { StepInformationType } from "../../../utils/playbook/stepInformation/handleStepInformation.ts";
import { InfoTypes } from "../../../utils/playbook/stepInformation/InfoTypes.ts";
import Text from "./info/Text.tsx";
import Chips from "./info/Chips.tsx";
import getNestedValue from "../../../utils/common/getNestedValue.ts";
import MarkdownOutput from "./MarkdownOutput.tsx";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";

type InfoRenderPropTypes = {
  taskId: string;
  info: StepInformationType;
};

function InfoRender({ taskId, info }: InfoRenderPropTypes) {
  const [, , , taskData] = useCurrentTask(taskId);
  const value = getNestedValue(taskData, info.key);

  switch (info.type) {
    case InfoTypes.TEXT:
      return <Text value={value} />;
    case InfoTypes.CHIPS:
      return <Chips value={value} />;
    case InfoTypes.MARKDOWN:
      return <MarkdownOutput className="!p-0" content={value} />;
    default:
      return <></>;
  }
}

export default InfoRender;
