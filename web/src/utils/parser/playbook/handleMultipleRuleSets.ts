import { store } from "../../../store";
import {
  addRelationKey,
  duplicateStep,
} from "../../../store/features/playbook/playbookSlice";
import {
  currentPlaybookSelector,
  playbookSelector,
} from "../../../store/features/playbook/selectors";

// This function handles multiple rule sets
// 1. This will ensure we have child for every step relation
// 2. If not, it will duplicate the first step
export const handleMultipleRuleSets = () => {
  const currentPlaybook = currentPlaybookSelector(store.getState());
  if (!currentPlaybook) return null;
  const steps = currentPlaybook.steps ?? [];
  if (steps.length < 2) return;
  const relations = currentPlaybook.step_relations ?? [];
  relations.forEach((relation, i) => {
    if (i === 0 || relation.child) return;
    store.dispatch(duplicateStep({ id: steps[1].id }));
    const { currentVisibleStep, currentPlaybook } = playbookSelector(
      store.getState(),
    );
    if (!currentVisibleStep) return;
    const child = currentPlaybook?.steps.find(
      (e) => e.id === currentVisibleStep,
    );
    store.dispatch(
      addRelationKey({
        id: relation.id,
        key: "child",
        value: child,
      }),
    );
  });
};
