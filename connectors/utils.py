import logging

from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.models import integrations_connector_type_display_name_map, \
    integrations_connector_type_connector_keys_map, integrations_connector_type_category_map, \
    integrations_connector_key_display_name_map
from connectors.tasks import populate_connector_metadata
from executor.source_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from executor.source_processors.azure_api_processor import AzureApiProcessor
from executor.source_processors.clickhouse_db_processor import ClickhouseDBProcessor
from executor.source_processors.datadog_api_processor import DatadogApiProcessor
from executor.source_processors.db_connection_string_processor import DBConnectionStringProcessor
from executor.source_processors.elastic_search_api_processor import ElasticSearchApiProcessor
from executor.source_processors.gke_api_processor import GkeApiProcessor
from executor.source_processors.grafana_api_processor import GrafanaApiProcessor
from executor.source_processors.grafana_loki_api_processor import GrafanaLokiApiProcessor
from executor.source_processors.mimir_api_processor import MimirApiProcessor
from executor.source_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
from executor.source_processors.pd_api_processor import PdApiProcessor
from executor.source_processors.postgres_db_processor import PostgresDBProcessor
from executor.source_processors.remote_server_processor import RemoteServerProcessor
from executor.source_processors.slack_api_processor import SlackApiProcessor
from executor.source_processors.vpc_api_processor import VpcApiProcessor
from executor.source_processors.ms_teams_api_processor import MSTeamsApiProcessor
from management.crud.task_crud import get_or_create_task, check_scheduled_or_running_task_run_for_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import SourceKeyType, Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto
from utils.time_utils import current_datetime

logger = logging.getLogger(__name__)

connector_type_api_processor_map = {
    Source.CLOUDWATCH: AWSBoto3ApiProcessor,
    Source.EKS: AWSBoto3ApiProcessor,
    Source.CLICKHOUSE: ClickhouseDBProcessor,
    Source.DATADOG: DatadogApiProcessor,
    Source.GRAFANA: GrafanaApiProcessor,
    Source.NEW_RELIC: NewRelicGraphQlConnector,
    Source.POSTGRES: PostgresDBProcessor,
    Source.GRAFANA_VPC: VpcApiProcessor,
    Source.SLACK: SlackApiProcessor,
    Source.SQL_DATABASE_CONNECTION: DBConnectionStringProcessor,
    Source.GRAFANA_MIMIR: MimirApiProcessor,
    Source.AZURE: AzureApiProcessor,
    Source.GKE: GkeApiProcessor,
    Source.REMOTE_SERVER: RemoteServerProcessor,
    Source.MS_TEAMS: MSTeamsApiProcessor,
    Source.PAGER_DUTY: PdApiProcessor,
    Source.ELASTIC_SEARCH: ElasticSearchApiProcessor,
    Source.GRAFANA_LOKI: GrafanaLokiApiProcessor
}


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
    elif connector_type == Source.CLOUDWATCH or connector_type == Source.EKS:
        for conn_key in connector_keys:
            if conn_key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                credentials_dict['aws_access_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_SECRET_KEY:
                credentials_dict['aws_secret_key'] = conn_key.key.value
            elif conn_key.key_type == SourceKeyType.AWS_REGION:
                regions = credentials_dict.get('regions', [])
                regions.append(conn_key.key.value)
                credentials_dict['regions'] = regions
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
    elif connector_type == Source.REMOTE_SERVER:
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
            elif conn_key.key_type == SourceKeyType.SSL_VERIFY:
                credentials_dict['ssl_verify'] = 'true'
                if conn_key.key.value.lower() == 'false':
                    credentials_dict['ssl_verify'] = 'false'
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


def test_connection_connector(connector_proto: ConnectorProto, connector_keys: [SourceKeyType]) -> (bool, str):
    if not connector_proto.type:
        return False, 'Received invalid Connector Config'

    connector_type: Source = connector_proto.type
    all_ck_types = [ck.key_type for ck in connector_keys]
    required_key_types = integrations_connector_type_connector_keys_map.get(connector_type)
    all_keys_found = False
    for rkt in required_key_types:
        if sorted(rkt) == sorted(list(set(all_ck_types))):
            all_keys_found = True
            break
    if not all_keys_found:
        return False, f'Missing Required Connector Keys for Connector Type: ' \
                      f'{integrations_connector_type_display_name_map.get(connector_type, Source.Name(connector_type))}'
    credentials_dict = generate_credentials_dict(connector_type, connector_keys)
    try:
        api_processor = connector_type_api_processor_map.get(connector_type)
        if not api_processor:
            return True, 'Source Test Connection Not Implemented'
        connection_state = False
        if connector_type == Source.CLOUDWATCH:
            for region in credentials_dict.get('regions', []):
                updated_credentials_dict = credentials_dict.copy()
                updated_credentials_dict.pop('regions', None)
                updated_credentials_dict['client_type'] = 'cloudwatch'
                updated_credentials_dict['region'] = region
                connection_state = api_processor(**updated_credentials_dict).test_connection()
                if not connection_state:
                    break
        elif connector_type == Source.EKS:
            for region in credentials_dict.get('regions', []):
                updated_credentials_dict = credentials_dict.copy()
                updated_credentials_dict.pop('regions', None)
                updated_credentials_dict['client_type'] = 'eks'
                updated_credentials_dict['region'] = region
                connection_state = api_processor(**updated_credentials_dict).test_connection()
                if not connection_state:
                    break
        elif connector_type == Source.DATADOG:
            credentials_dict['dd_connector_type'] = Source.DATADOG
            connection_state = api_processor(**credentials_dict).test_connection()
        elif connector_type == Source.GRAFANA_VPC:
            grafana_health_check_path = 'api/datasources'
            response = api_processor(**credentials_dict).v1_api_grafana(grafana_health_check_path)
            if response:
                connection_state = True
            else:
                connection_state = False
        else:
            connection_state = api_processor(**credentials_dict).test_connection()
        if not connection_state:
            return False, f'Error testing connection for Connector Type: ' \
                          f'{integrations_connector_type_display_name_map.get(connector_type, Source.Name(connector_type))}'
    except Exception as e:
        logger.error(f'Error testing connection for Connector Type: {str(e)}')
        return False, f'Error testing connection for Connector Type: ' \
                      f'{integrations_connector_type_display_name_map.get(connector_type, Source.Name(connector_type))} ' \
                      f'with error: {str(e)}'
    return True, 'Source Connection Successful'
