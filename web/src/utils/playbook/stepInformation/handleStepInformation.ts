import { taskTypes } from "../../../constants/index.ts";
import getCurrentTask from "../../getCurrentTask.ts";
import * as StepInformation from "./index.ts";
import { InfoType } from "./InfoTypes.ts";

export type StepInformationType = {
  label: string;
  key: string;
  type: InfoType;
};

export default function handleStepInformation(
  stepId: string,
): StepInformationType[] {
  const [step] = getCurrentTask(stepId);
  const type = `${step.source} ${step.taskType}`;

  switch (type) {
    case taskTypes.CLOUDWATCH_METRIC:
      return StepInformation.cloudwatchMetric;

    default:
      return [];
  }
}
