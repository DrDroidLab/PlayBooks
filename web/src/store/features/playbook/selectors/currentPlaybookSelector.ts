import { RootState } from "../../../index.ts";

export const currentPlaybookSelector = (state: RootState) =>
  state.playbook.currentPlaybook;
