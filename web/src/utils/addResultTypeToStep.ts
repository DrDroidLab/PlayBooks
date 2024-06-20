import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";
import { Step } from "../types.ts";
import { updateCardByIndex } from "./execution/updateCardByIndex.ts";

function addResultTypeToStep(step: Step) {
  const { connectorOptions } = playbookSelector(store.getState());
  const currentConnector = connectorOptions?.find(
    (e) => e.id === step?.source,
  )?.connector;

  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const taskType = taskTypes.find((e) => e.task_type === step.taskType);

  updateCardByIndex("resultType", taskType.result_type, step.stepIndex);
}

export default addResultTypeToStep;
