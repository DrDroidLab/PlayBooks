import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { store } from "../store/index.ts";
import { Step } from "../types.ts";
import { updateCardById } from "./execution/updateCardById.ts";

function addResultTypeToStep(step: Step) {
  const { connectorOptions } = playbookSelector(store.getState());
  const currentConnector = connectorOptions?.find(
    (e) => e.id === step?.source,
  )?.connector;

  const taskTypes = currentConnector?.supported_task_type_options ?? [];
  const taskType = taskTypes.find((e) => e.task_type === step.taskType);

  updateCardById("resultType", taskType.result_type, step.id);
}

export default addResultTypeToStep;
