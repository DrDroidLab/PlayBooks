// Workflows

export const GET_WORKFLOWS = "/executor/workflows/get";
export const CREATE_WORKFLOW = "/executor/workflows/create";
export const TEST_WORKFLOW_NOTIFICATION =
  "/executor/workflows/test_notification";
export const UPDATE_WORKFLOW = "/executor/workflows/update";
export const DELETE_WORKFLOW = "/executor/workflows/update";
export const GET_WORKFLOW_EXECUTIONS = "/executor/workflows/executions/list";
export const GET_WORKFLOW_EXECUTION_LOGS =
  "/executor/workflows/executions/get/all/logs";

export const GENERATE_CURL = "/executor/workflows/generate/curl";
export const GENERATE_WEBHOOK =
  "/connectors/handlers/pagerduty/generate/webhook";
export const GENERATE_ZENDUTY_WEBHOOK =
  "/connectors/handlers/zenduty/generate/webhook";

export const TEST_TRANSFORMER = "/executor/workflows/test_transformer";
export const EXECUTE_WORKFLOW = "/executor/workflows/execute";
export const STOP_WORKFLOW_EXECUTION =
  "/executor/workflows/executions/terminate";
