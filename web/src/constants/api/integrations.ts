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
export const GENERATE_MANIFEST =
  "/connectors/handlers/slack_bot/app_manifest_create";

export const GOOGLE_SPACES_LIST =
  "/connectors/integrations/handlers/g_chat/list_spaces";
export const GOOGLE_SPACES_REGISTER =
  "/connectors/integrations/handlers/g_chat/register_spaces";
export const SAVE_SITE_URL = "/connectors/save_site_url";
export const GET_SITE_URL = "/connectors/get_site_url";

export const GET_CONNECTED_PLAYBOOKS = "/connectors/connected_playbooks/get";
