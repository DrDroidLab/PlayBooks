// Integrations
export const ALL_CONNECTORS = "/connectors/list";
export const GET_CONNECTOR_DETAILS = "/connectors/get";
export const GET_CONNECTOR_OPTIONS = "/connectors/keys/options";
export const GET_CONNECTOR_KEYS = "/connectors/keys/get";
export const UPDATE_CONNECTOR_STATUS = "/connectors/update";
export const CREATE_CONNECTOR_STATUS = "/connectors/create";
export const TEST_CONNECTION = "/connectors/test_connection";
export const GET_CONNECTOR_ASSETS = "/connectors/assets/models/get";

export const GET_SLACK_ASSETS = "/connectors/assets/models/get";
export const UPDATE_SLACK_RCA =
  "/connectors/alertops/slack/alerts/auto_rca/update_state";
export const GENERATE_MANIFEST = "/connectors/slack/app_manifest/create";

export const GOOGLE_SPACES_LIST =
  "/connectors/integrations/handlers/g_chat/list_spaces";
export const GOOGLE_SPACES_REGISTER =
  "/connectors/integrations/handlers/g_chat/register_spaces";
