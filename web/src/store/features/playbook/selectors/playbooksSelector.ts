import { RootState } from "../../../index.ts";

export const playbooksSelector = (state: RootState) => state.playbook.playbooks;
