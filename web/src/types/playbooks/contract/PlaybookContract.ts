import { PlaybookContractStep } from "./index.ts";

export interface PlaybookContract {
  id?: string | null;
  name?: string;
  description?: string;
  global_variable_set: any;
  steps: PlaybookContractStep[];
}
