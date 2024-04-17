export const API_URL = '/';

// Auth
export const REFRESH_TOKEN = '/accounts/token/refresh/';
export const LOGOUT_USER = '/accounts/logout/';

// Playbooks
export const GET_PLAYBOOKS = '/playbooks/get';
export const UPDATE_PLAYBOOK = '/playbooks/update';
export const GET_CONNECTORS = '/connectors/playbooks/builder/sources/options';
export const GET_ASSET_MODEL_OPTIONS = '/connectors/assets/models/options';
export const GET_ASSETS = '/connectors/assets/models/get';

export const DELETE_PLAYBOOK = '/playbooks/update';

// Triggers
export const CREATE_TRIGGER = '/connectors/alertops/playbook_triggers/create';
export const DELETE_TRIGGER = '/connectors/playbooks/update';
export const GET_TRIGGERS = '/connectors/alertops/playbook_triggers/get';
export const GET_TRIGGER = '/connectors/alertops/triggers/get';
export const GET_TRIGGER_OPTIONS = '/connectors/alertops/options/get';
export const SEARCH_TRIGGER = '/connectors/alertops/slack/alerts/search';

// Playground
export const GET_PLAYGROUNDS = '/connectors/playbooks/playground/get';
export const RUN_PLAYGROUND_TASK = '/connectors/playbooks/playground/run_playbook_task';
export const RUN_PLAYGROUND_STEP = '/connectors/playbooks/playground/run_playbook_step';
export const GET_PLAYGROUND_CONNECTORS = '/connectors/playbooks/playground/sources/options';
export const GET_PLAYGROUND_ASSET_MODEL_OPTIONS =
  '/connectors/playbooks/playground/assets/models/options';
export const GET_PLAYGROUND_ASSETS = '/connectors/playbooks/playground/assets/models/get';
export const EXECUTE_TASK = '/connectors/playbooks/playground/run_playbook_task';

// Integrations
export const ALL_CONNECTORS = '/connectors/list';
export const GET_CONNECTOR_OPTIONS = '/connectors/keys/options';
export const GET_CONNECTOR_KEYS = '/connectors/keys/get';
export const UPDATE_CONNECTOR_STATUS = '/connectors/update';
export const CREATE_CONNECTOR_STATUS = '/connectors/create';
export const TEST_CONNECTION = '/connectors/test_connection';
export const GET_CONNECTOR_ASSETS = '/connectors/assets/models/get';

export const GET_SLACK_ASSETS = '/connectors/assets/models/get';
export const UPDATE_SLACK_RCA = '/connectors/alertops/slack/alerts/auto_rca/update_state';

// Alert Insights
export const GET_SLACK_ALERT_METRIC = '/connectors/alertops/slack/get_alert_metric';

// Sample Alert Insights
export const GET_ALERT_OPTIONS_PLAYGROUND = '/connectors/alertops/playground/options/get';
export const GET_CONNECTED_INTEGRATION_PLAYGROUND =
  '/connectors/alertops/playground/options/get_connected_integration';
export const GET_ALERT_DISTRIBUTION_BY_CHANNEL_PLAYGROUND =
  '/connectors/alertops/playground/slack/get_alert_distribution_by_channel';
export const GET_ALERT_DISTRIBUTION_BY_ALERT_TYPE_PLAYGROUND =
  '/connectors/alertops/playground/slack/get_alert_distribution_by_alert_type';
export const GET_MOST_ALERTING_ENTITIES_BY_TOOLS_PLAYGROUND =
  '/connectors/alertops/playground/get_most_alerting_entities_by_tools';
export const GET_MOST_FREQUENT_ALERT_PLAYGROUND =
  '/connectors/alertops/playground/slack/get_alert_most_frequent';
export const GET_MOST_FREQUENT_DISTRIBUTION_PLAYGROUND =
  '/connectors/alertops/playground/slack/get_alert_most_frequent_distribution';
export const GET_ALERT_TAGS_PLAYGROUND =
  '/connectors/alertops/playground/slack/options/get_alert_tags';
export const GET_SLACK_ALERT_METRIC_PLAYGROUND =
  '/connectors/alertops/playground/slack/get_alert_metric';
export const GENERATE_AQS_PLAYGROUND = '/connectors/alertops/playground/slack/alerts/generate_aqs';
export const GENERATE_AQS_TRENDS_PLAYGROUND =
  '/connectors/alertops/playground/slack/alerts/generate_aqs_trend';
