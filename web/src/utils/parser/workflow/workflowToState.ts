import {
  defaultCode,
  exampleInput,
} from "../../../store/features/workflow/workflowSlice.ts";
import * as Extractors from "../../workflow/extractors/index.ts";
import * as Types from "../../workflow/types/index.ts";
import globalVariableToState from "./globalVariableToState.ts";

export const workflowToState = (workflow) => {
  const workflowActionType =
    workflow?.actions?.length > 0
      ? workflow.actions[0]?.type?.toLowerCase()
      : "";
  const workflowAction: Types.WorkflowActionContractType =
    workflow?.actions?.length > 0
      ? workflow.actions[0][workflowActionType]
      : {};

  const entryPointType =
    workflow?.entry_points?.length > 0
      ? workflow.entry_points[0]?.type?.toLowerCase()
      : "";
  const entryPoint: Types.WorkflowEntryPointContractType =
    workflow?.entry_points?.length > 0
      ? workflow.entry_points[0][entryPointType]
      : {};

  const scheduleType = workflow?.schedule?.type?.toLowerCase();
  const schedule: Types.ScheduleContractType = workflow?.schedule[scheduleType];

  const playbookId =
    workflow?.playbooks?.length > 0 ? workflow?.playbooks[0].id : null;

  const currentWorkflow = {
    name: workflow.name,
    type: workflow.type ?? "STANDARD",
    playbookId,
    notification: workflowActionType,
    workflowType: entryPointType,
    schedule: scheduleType,
    generateSummary: workflow?.configuration?.generate_summary,
    useTransformer:
      workflow?.configuration?.transformer_lambda_function?.definition !==
      undefined,
    evaluation_window_in_seconds:
      workflow?.configuration?.evaluation_window_in_seconds,
    transformerCode:
      workflow?.configuration?.transformer_lambda_function?.definition ??
      defaultCode,
    globalVariables: globalVariableToState(
      workflow?.configuration?.global_variable_set ?? {},
    ),
    exampleInput,
    ...Extractors.handleActionsExtractor(workflowActionType, workflowAction),
    ...Extractors.handleEntryPointsExtractor(entryPointType, entryPoint),
    ...Extractors.handleScheduleExtractor(scheduleType, schedule),
  };

  return currentWorkflow;
};
