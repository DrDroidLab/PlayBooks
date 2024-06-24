import React from "react";
import { StepInformationType } from "../../../utils/playbook/stepInformation/handleStepInformation.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { InfoTypes } from "../../../utils/playbook/stepInformation/InfoTypes.ts";
import Text from "./info/Text.tsx";
import Chips from "./info/Chips.tsx";
import getNestedValue from "../../../utils/getNestedValue.ts";

type InfoRenderPropTypes = {
  stepId: string;
  info: StepInformationType;
};

function InfoRender({ stepId, info }: InfoRenderPropTypes) {
  const [step] = useCurrentStep(stepId);
  const value = getNestedValue(step, info.key);

  switch (info.type) {
    case InfoTypes.TEXT:
      return <Text value={value} />;
    case InfoTypes.CHIPS:
      return <Chips value={value} />;
    default:
      return <></>;
  }
}

export default InfoRender;
