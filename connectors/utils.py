import logging

from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.models import integrations_connector_type_display_name_map, \
    integrations_connector_type_connector_keys_map, integrations_connector_type_category_map, \
    integrations_connector_key_display_name_map
from connectors.tasks import populate_connector_metadata
from management.crud.task_crud import get_or_create_task, check_scheduled_or_running_task_run_for_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import SourceKeyType, Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto
from utils.time_utils import current_datetime

logger = logging.getLogger(__name__)


def get_all_request_connectors():
    return []


def get_all_available_connectors():
    all_connectors = list(integrations_connector_type_connector_keys_map.keys())
    all_available_connectors = []
    for c in all_connectors:
        all_available_connectors.append(
            ConnectorProto(type=c, display_name=StringValue(value=integrations_connector_type_display_name_map.get(c)),
                           category=StringValue(value=integrations_connector_type_category_map.get(c, Source.Name(c)))))
    return all_available_connectors


def get_connector_keys_options(connector_type):
    if not connector_type:
        return None
    source_key_options = integrations_connector_type_connector_keys_map.get(connector_type)
    all_keys = []
    for sko in source_key_options:
        all_keys.extend(sko)
    all_keys = list(set(all_keys))
    if not all_keys:
        return None
    connector_key_option_protos = []
    for sk in all_keys:
        connector_key_option_protos.append(ConnectorKeyProto(key_type=sk, display_name=StringValue(
            value=integrations_connector_key_display_name_map.get(sk))))
    connector_display_name = integrations_connector_type_display_name_map.get(connector_type,
                                                                              Source.Name(connector_type))
    connector = ConnectorProto(type=connector_type, display_name=StringValue(value=connector_display_name),
                               keys=connector_key_option_protos)
    return connector, connector_key_option_protos


def generate_credentials_dict(connector_type, connector_keys):
    credentials_dict = {}
    if connector_type == Source.NEW_RELIC:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.NEWRELIC_API_KEY:
                credentials_dict['nr_api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.NEWRELIC_APP_ID:
                credentials_dict['nr_app_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.NEWRELIC_API_DOMAIN:
                credentials_dict['nr_api_domain'] = conn_key.key.value
    elif connector_type == Source.DATADOG or connector_type == Source.DATADOG_OAUTH:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.DATADOG_API_KEY:
                credentials_dict['dd_api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.DATADOG_APP_KEY:
                credentials_dict['dd_app_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.DATADOG_API_DOMAIN:
                credentials_dict['dd_api_domain'] = conn_key.key.value
            credentials_dict['dd_connector_type'] = connector_type
    elif connector_type == Source.CLOUDWATCH:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                credentials_dict['aws_access_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_SECRET_KEY:
                credentials_dict['aws_secret_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_REGION:
                credentials_dict['region'] = conn_key.key.value
    elif connector_type == Source.EKS:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                credentials_dict['aws_access_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_SECRET_KEY:
                credentials_dict['aws_secret_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_REGION:
                credentials_dict['region'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.EKS_ROLE_ARN:
                credentials_dict['k8_role_arn'] = conn_key.key.value
    elif connector_type == Source.GRAFANA:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.GRAFANA_API_KEY:
                credentials_dict['grafana_api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.GRAFANA_HOST:
                credentials_dict['grafana_host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SSL_VERIFY:
                credentials_dict['ssl_verify'] = 'true'
                if conn_key.key.value.lower() == 'false':
                    credentials_dict['ssl_verify'] = 'false'
    elif connector_type == Source.GRAFANA_VPC:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.AGENT_PROXY_API_KEY:
                credentials_dict['agent_proxy_api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AGENT_PROXY_HOST:
                credentials_dict['agent_proxy_host'] = conn_key.key.value
            credentials_dict['parent_source'] = Source.GRAFANA_VPC
    elif connector_type == Source.GRAFANA_MIMIR:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.MIMIR_HOST:
                credentials_dict['mimir_host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.X_SCOPE_ORG_ID:
                credentials_dict['x_scope_org_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SSL_VERIFY:
                credentials_dict['ssl_verify'] = 'true'
                if conn_key.key.value.lower() == 'false':
                    credentials_dict['ssl_verify'] = 'false'
    elif connector_type == Source.CLICKHOUSE:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.CLICKHOUSE_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.CLICKHOUSE_USER:
                credentials_dict['user'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.CLICKHOUSE_PASSWORD:
                credentials_dict['password'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.CLICKHOUSE_INTERFACE:
                credentials_dict['interface'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.CLICKHOUSE_PORT:
                credentials_dict['port'] = conn_key.key.value
    elif connector_type == Source.POSTGRES:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.POSTGRES_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.POSTGRES_USER:
                credentials_dict['user'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.POSTGRES_PASSWORD:
                credentials_dict['password'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.POSTGRES_DATABASE:
                credentials_dict['database'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.POSTGRES_PORT:
                credentials_dict['port'] = conn_key.key.value
    elif connector_type == Source.SQL_DATABASE_CONNECTION:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.SQL_DATABASE_CONNECTION_STRING_URI:
                credentials_dict['connection_string'] = conn_key.key.value
    elif connector_type == Source.SLACK:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.SLACK_BOT_AUTH_TOKEN:
                credentials_dict['bot_auth_token'] = conn_key.key.value
    elif connector_type == Source.BASH:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.REMOTE_SERVER_HOST:
                ssh_servers = conn_key.key.value
                ssh_servers = ssh_servers.replace(' ', '')
                ssh_servers = ssh_servers.split(',')
                ssh_servers = list(filter(None, ssh_servers))
                credentials_dict['remote_host'] = ssh_servers[0]
            elif conn_key.key_type == SourceKeyType.REMOTE_SERVER_PEM:
                credentials_dict['remote_pem'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.REMOTE_SERVER_PASSWORD:
                credentials_dict['remote_password'] = conn_key.key.value
            if 'remote_pem' not in credentials_dict:
                credentials_dict['remote_pem'] = None
            if 'remote_password' not in credentials_dict:
                credentials_dict['remote_password'] = None
    elif connector_type == Source.AZURE:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.AZURE_CLIENT_ID:
                credentials_dict['client_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AZURE_CLIENT_SECRET:
                credentials_dict['client_secret'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AZURE_TENANT_ID:
                credentials_dict['tenant_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AZURE_SUBSCRIPTION_ID:
                credentials_dict['subscription_id'] = conn_key.key.value
    elif connector_type == Source.GKE:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.GKE_PROJECT_ID:
                credentials_dict['project_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.GKE_SERVICE_ACCOUNT_JSON:
                credentials_dict['service_account_json'] = conn_key.key.value
    elif connector_type == Source.MS_TEAMS:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.MS_TEAMS_CONNECTOR_WEBHOOK_URL:
                credentials_dict['webhook_url'] = conn_key.key.value
    elif connector_type == Source.PAGER_DUTY:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.PAGER_DUTY_API_KEY:
                credentials_dict['api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.PAGER_DUTY_CONFIGURED_EMAIL:
                credentials_dict['configured_email'] = conn_key.key.value
    elif connector_type == Source.ROOTLY:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.ROOTLY_API_KEY:
                credentials_dict['api_key'] = conn_key.key.value
    elif connector_type == Source.ZENDUTY:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.ZENDUTY_API_KEY:
                credentials_dict['api_key'] = conn_key.key.value
    elif connector_type == Source.ELASTIC_SEARCH:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.ELASTIC_SEARCH_PROTOCOL:
                credentials_dict['protocol'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.ELASTIC_SEARCH_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.ELASTIC_SEARCH_PORT:
                credentials_dict['port'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.ELASTIC_SEARCH_API_KEY_ID:
                credentials_dict['api_key_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.ELASTIC_SEARCH_API_KEY:
                credentials_dict['api_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SSL_VERIFY:
                credentials_dict['verify_certs'] = True
                if conn_key.key.value.lower() == 'false':
                    credentials_dict['verify_certs'] = False
            if 'port' not in credentials_dict:
                credentials_dict['port'] = '9200'
    elif connector_type == Source.GRAFANA_LOKI:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.GRAFANA_LOKI_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.GRAFANA_LOKI_PORT:
                credentials_dict['port'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.GRAFANA_LOKI_PROTOCOL:
                credentials_dict['protocol'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.X_SCOPE_ORG_ID:
                credentials_dict['x_scope_org_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SSL_VERIFY:
                credentials_dict['ssl_verify'] = 'true'
                if conn_key.key.value.lower() == 'false':
                    credentials_dict['ssl_verify'] = 'false'
    elif connector_type == Source.KUBERNETES:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.KUBERNETES_CLUSTER_API_SERVER:
                credentials_dict['api_server'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.KUBERNETES_CLUSTER_TOKEN:
                credentials_dict['token'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_DATA:
                credentials_dict['ssl_ca_cert'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.KUBERNETES_CLUSTER_CERTIFICATE_AUTHORITY_PATH:
                credentials_dict['ssl_ca_cert_path'] = conn_key.key.value
    elif connector_type == Source.GCM:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.GCM_PROJECT_ID:
                credentials_dict['project_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.GCM_SERVICE_ACCOUNT_JSON:
                credentials_dict['service_account_json'] = conn_key.key.value
    elif connector_type == Source.SMTP:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.SMTP_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SMTP_PORT:
                credentials_dict['port'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SMTP_USER:
                credentials_dict['username'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.SMTP_PASSWORD:
                credentials_dict['password'] = conn_key.key.value
    elif connector_type == Source.BIG_QUERY:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.BIG_QUERY_PROJECT_ID:
                credentials_dict['project_id'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.BIG_QUERY_SERVICE_ACCOUNT_JSON:
                credentials_dict['service_account_json'] = conn_key.key.value
    elif connector_type == Source.JIRA_CLOUD:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.JIRA_CLOUD_API_KEY:
                credentials_dict['jira_cloud_api_key'] = conn_key.key.value
            if conn_key.key_type == SourceKeyType.JIRA_DOMAIN:
                credentials_dict['jira_domain'] = conn_key.key.value
            if conn_key.key_type == SourceKeyType.JIRA_EMAIL:
                credentials_dict['jira_email'] = conn_key.key.value
    elif connector_type == Source.ARGOCD:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.ARGOCD_SERVER:
                credentials_dict['argocd_server'] = conn_key.key.value
            if conn_key.key_type == SourceKeyType.ARGOCD_TOKEN:
                credentials_dict['argocd_token'] = conn_key.key.value
    else:
        return None
    return credentials_dict


def trigger_connector_metadata_fetch(account: Account, connector: ConnectorProto, connector_keys: [SourceKeyType]):
    if not connector or not connector_keys or not connector.id or not connector.id.value or not connector.type:
        logger.error(f'Invalid Connector Config for Metadata Fetch')
        return
    connector_id = connector.id.value
    connector_type: Source = connector.type
    credentials_dict = generate_credentials_dict(connector_type, connector_keys)
    if credentials_dict:
        saved_task = get_or_create_task(populate_connector_metadata.__name__, account.id, connector_id,
                                        connector_type, credentials_dict)
        if saved_task:
            if not check_scheduled_or_running_task_run_for_task(saved_task):
                current_date_time = current_datetime()
                task = populate_connector_metadata.delay(account.id, connector_id, connector_type, credentials_dict)
                try:
                    task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                      status=PeriodicTaskStatus.SCHEDULED,
                                                      account_id=account.id,
                                                      scheduled_at=current_date_time)
                except Exception as e:
                    logger.error(f"Exception occurred while saving task run for account: {account.id}, "
                                 f"connector_type: "
                                 f"{integrations_connector_type_display_name_map.get(connector_type, Source.Name(connector_type))} "
                                 f"with error: {e}")
    else:
        logger.error(f'Invalid Credentials for Connector: {connector_id}')
    return
