import { ApiCallTask, BashCommandTask } from "./index.ts";

export type ActionTask = {
  source: string;
  api_call_task?: ApiCallTask;
  bash_command_task?: BashCommandTask;
};
