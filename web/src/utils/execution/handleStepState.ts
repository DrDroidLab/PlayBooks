import { currentPlaybookSelector } from "../../store/features/playbook/playbookSlice.ts";
import { store } from "../../store/index.ts";
import {
  Playbook,
  Step,
  StepRelation,
  StepRelationContract,
  Task,
} from "../../types/index.ts";
import getCurrentStep from "../playbook/step/getCurrentStep.ts";
import { StepStateType, StepStates } from "./StepStates.ts";

function handleStepState(stepId: string): StepStateType {
  const currentPlaybook: Playbook | undefined = currentPlaybookSelector(
    store.getState(),
  );
  const [step, id] = getCurrentStep(stepId);
  let state: StepStateType = StepStates.DEFAULT;

  const stepRelations: (StepRelation | StepRelationContract)[] =
    currentPlaybook?.step_relations ?? [];
  const tasks: Task[] = currentPlaybook?.ui_requirement.tasks ?? [];
  const relations = stepRelations.filter((relation) => {
    const parentId =
      typeof (relation as StepRelation).parent === "string"
        ? (relation as StepRelation).parent
        : ((relation as StepRelation).parent as Step).id;
    return parentId === id;
  });

  const stepTasks = step?.tasks.map((task) =>
    tasks.find((t) => t.id === (typeof task === "string" ? task : task.id)),
  );

  const logs = relations.map(
    (relation) => relation?.ui_requirement?.evaluation?.evaluation_result,
  );

  if (!step) {
    state = StepStates.DEFAULT;
  }

  const taskWithError = stepTasks?.findIndex(
    (task) => task?.ui_requirement.outputError,
  );
  const logWithError = logs?.find((log) => !log);

  if (step?.ui_requirement.showOutput) {
    if (taskWithError !== -1) {
      state = StepStates.ERROR;
    } else {
      state = StepStates.SUCCESS;
    }
  }

  if (logWithError) {
    state = StepStates.ERROR;
  }

  return state;
}

export default handleStepState;
