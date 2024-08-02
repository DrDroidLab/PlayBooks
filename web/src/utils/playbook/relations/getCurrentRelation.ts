import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { store } from "../../../store/index.ts";
import {
  StepRelation,
  StepRelationContract,
} from "../../../types/playbooks/stepRelations.ts";

function getCurrentRelation(
  id: string,
): [StepRelation | StepRelationContract | undefined, string | undefined] {
  const { currentPlaybook } = playbookSelector(store.getState());
  const relations = currentPlaybook?.step_relations ?? [];
  const relation = relations.find((relation) => relation.id === id);

  return [relation, id];
}

export default getCurrentRelation;
