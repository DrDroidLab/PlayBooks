import { store } from "../../../store/index.ts";
import * as Injectors from "../../workflow/injectors/index.ts";
import stateToGlobalVariable from "./stateToGlobalVariable.ts";

export const stateToWorkflow = () => {
  const workflow: any = store.getState().workflows.currentWorkflow;

  const responseBody: any = {
    workflow: {
      id: workflow.id,
      name: workflow.name,
      schedule: {
        type: workflow.schedule?.toUpperCase(),
        [workflow.schedule]: Injectors.handleScheduleInjector(),
      },
      playbooks: [
        {
          id: parseInt(workflow.playbookId, 10),
        },
      ],
      entry_points: [
        {
          type: workflow.workflowType?.toUpperCase(),
          [workflow.workflowType]: Injectors.handleEntryPointsInjector(),
        },
      ],
      actions: workflow.notification
        ? [
            {
              type: workflow.notification?.toUpperCase(),
              [workflow.notification]: Injectors.handleActionsInjector(),
            },
          ]
        : [],
      configuration: {
        generate_summary: workflow?.generateSummary ?? false,
        global_variable_set: stateToGlobalVariable(workflow.globalVariables),
        transformer_lambda_function: workflow.useTransformer
          ? {
              definition: workflow.transformerCode,
            }
          : undefined,
      },
    },
  };

  return responseBody;
};
