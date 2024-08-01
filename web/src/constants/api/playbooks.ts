// Playbooks
export const GET_PLAYBOOKS = "/pb/get/v2";
export const UPDATE_PLAYBOOK = "/pb/update/v2";
export const CREATE_PLAYBOOK = "/pb/create/v2";
export const EXECUTE_TASK = "/executor/task/run/v3";
export const EXECUTE_BULK_TASK = "/executor/bulk_task/run";
export const EXECUTE_STEP = "/executor/step/run/v3";
export const EXECUTE_PLAYBOOK = "/executor/playbook/run/v2";
export const GET_CONNECTORS = "/connectors/playbooks/builder/sources/options";
export const GET_ASSET_MODEL_OPTIONS = "/connectors/assets/models/options";
export const GET_ASSETS = "/connectors/assets/models/get";
export const GET_BUILDER_OPTIONS = "/pb/builder/options";

export const DELETE_PLAYBOOK = "/pb/update";

// Playbook Logs
export const GET_PLAYBOOK_EXECUTION = "/pb/execution/get/v2";
export const GET_PLAYBOOK_EXECUTIONS = "/pb/executions/list";

// Executions
export const START_EXECUTION = "/executor/execution/create";
export const EXECUTION_STEP_EXECUTE = "/executor/execution/step/execute";
export const UPDATE_EXECUTION_STATUS = "/executor/execution/status/update";
