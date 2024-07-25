import { RootState } from "../../../index.ts";

export const stepsSelector = (state: RootState) =>
  state.playbook.currentPlaybook?.ui_requirement.tasks ?? [];
