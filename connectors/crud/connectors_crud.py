import logging

from django.db import transaction as dj_transaction
from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from connectors.models import Connector, ConnectorKey, integrations_connector_type_connector_keys_map, \
    integrations_connector_type_display_name_map, integrations_connector_type_category_map, \
    integrations_connector_key_display_name_map
from integrations_api_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from integrations_api_processors.clickhouse_db_processor import ClickhouseDBProcessor
from integrations_api_processors.datadog_api_processor import DatadogApiProcessor
from integrations_api_processors.db_connection_string_processor import DBConnectionStringProcessor
from integrations_api_processors.grafana_api_processor import GrafanaApiProcessor
from integrations_api_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
from integrations_api_processors.postgres_db_processor import PostgresDBProcessor
from integrations_api_processors.slack_api_processor import SlackApiProcessor
from integrations_api_processors.vpc_api_processor import VpcApiProcessor
from management.crud.task_crud import get_or_create_task, check_scheduled_or_running_task_run_for_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import Source as ConnectorType

from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorKey as ConnectorKeyProto
from utils.time_utils import current_milli_time, current_datetime
from connectors.tasks import populate_connector_metadata
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


class ConnectorCrudException(ValueError):
    pass


connector_type_api_processor_map = {
    ConnectorType.CLOUDWATCH: AWSBoto3ApiProcessor,
    ConnectorType.EKS: AWSBoto3ApiProcessor,
    ConnectorType.CLICKHOUSE: ClickhouseDBProcessor,
    ConnectorType.DATADOG: DatadogApiProcessor,
    ConnectorType.GRAFANA: GrafanaApiProcessor,
    ConnectorType.NEW_RELIC: NewRelicGraphQlConnector,
    ConnectorType.POSTGRES: PostgresDBProcessor,
    ConnectorType.GRAFANA_VPC: VpcApiProcessor,
    ConnectorType.SLACK: SlackApiProcessor,
    ConnectorType.SQL_DATABASE_CONNECTION: DBConnectionStringProcessor
}


def generate_credentials_dict(connector_type, connector_keys):
    credentials_dict = {}
    if connector_type == ConnectorType.NEW_RELIC:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.NEWRELIC_API_KEY:
                credentials_dict['nr_api_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.NEWRELIC_APP_ID:
                credentials_dict['nr_app_id'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.NEWRELIC_API_DOMAIN:
                credentials_dict['nr_api_domain'] = conn_key.key.value
    elif connector_type == ConnectorType.DATADOG:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.DATADOG_API_KEY:
                credentials_dict['dd_api_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.DATADOG_APP_KEY:
                credentials_dict['dd_app_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.DATADOG_API_DOMAIN:
                credentials_dict['dd_api_domain'] = conn_key.key.value
    elif connector_type == ConnectorType.CLOUDWATCH:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.AWS_ACCESS_KEY:
                credentials_dict['aws_access_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.AWS_SECRET_KEY:
                credentials_dict['aws_secret_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.AWS_REGION:
                regions = credentials_dict.get('regions', [])
                regions.append(conn_key.key.value)
                credentials_dict['regions'] = regions
    elif connector_type == ConnectorType.EKS:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.AWS_ACCESS_KEY:
                credentials_dict['aws_access_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.AWS_SECRET_KEY:
                credentials_dict['aws_secret_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.AWS_REGION:
                regions = credentials_dict.get('regions', [])
                regions.append(conn_key.key.value)
                credentials_dict['regions'] = regions
    elif connector_type == ConnectorType.GRAFANA:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.GRAFANA_API_KEY:
                credentials_dict['grafana_api_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.GRAFANA_HOST:
                credentials_dict['grafana_host'] = conn_key.key.value
    elif connector_type == ConnectorType.GRAFANA_VPC:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.AGENT_PROXY_API_KEY:
                credentials_dict['agent_proxy_api_key'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.AGENT_PROXY_HOST:
                credentials_dict['agent_proxy_host'] = conn_key.key.value
    elif connector_type == ConnectorType.CLICKHOUSE:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.CLICKHOUSE_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.CLICKHOUSE_USER:
                credentials_dict['user'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.CLICKHOUSE_PASSWORD:
                credentials_dict['password'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.CLICKHOUSE_INTERFACE:
                credentials_dict['interface'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.CLICKHOUSE_PORT:
                credentials_dict['port'] = conn_key.key.value
    elif connector_type == ConnectorType.POSTGRES:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.POSTGRES_HOST:
                credentials_dict['host'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.POSTGRES_USER:
                credentials_dict['user'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.POSTGRES_PASSWORD:
                credentials_dict['password'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.POSTGRES_DATABASE:
                credentials_dict['database'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.POSTGRES_PORT:
                credentials_dict['port'] = conn_key.key.value
    elif connector_type == ConnectorType.SQL_DATABASE_CONNECTION:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.SQL_DATABASE_CONNECTION_STRING_URI:
                credentials_dict['connection_string'] = conn_key.key.value
    elif connector_type == ConnectorType.SLACK:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.SLACK_BOT_AUTH_TOKEN:
                credentials_dict['bot_auth_token'] = conn_key.key.value
    elif connector_type == ConnectorType.REMOTE_SERVER:
        for conn_key in connector_keys:
            if conn_key.key_type == ConnectorKeyProto.REMOTE_SERVER_HOST:
                credentials_dict['remote_host'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.REMOTE_SERVER_USER:
                credentials_dict['remote_user'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.REMOTE_SERVER_PEM:
                credentials_dict['remote_pem'] = conn_key.key.value
            elif conn_key.key_type == ConnectorKeyProto.REMOTE_SERVER_PASSWORD:
                credentials_dict['remote_password'] = conn_key.key.value
            if 'remote_pem' not in credentials_dict:
                credentials_dict['remote_pem'] = None
            if 'remote_password' not in credentials_dict:
                credentials_dict['remote_password'] = None
    else:
        return None
    return credentials_dict


def get_all_request_connectors():
    return []


def get_all_available_connectors(all_active_connectors):
    all_connectors = list(integrations_connector_type_connector_keys_map.keys())
    for ac in all_active_connectors:
        all_connectors.remove(ac.connector_type)
    all_available_connectors = []
    for c in all_connectors:
        all_available_connectors.append(
            ConnectorProto(type=c, display_name=StringValue(value=integrations_connector_type_display_name_map.get(c)),
                           category=StringValue(value=integrations_connector_type_category_map.get(c))))
    return all_available_connectors


def get_connector_keys_options(connector_type):
    if not connector_type:
        return None
    connector_keys = integrations_connector_type_connector_keys_map.get(connector_type)[0]
    if not connector_keys:
        return None
    connector_key_option_protos = []
    for ck in connector_keys:
        connector_key_option_protos.append(ConnectorKeyProto(key_type=ck, display_name=StringValue(
            value=integrations_connector_key_display_name_map.get(ck))))
    return connector_key_option_protos


def get_db_account_connectors(account: Account, connector_id=None, connector_name=None, connector_type=None,
                              connector_type_list=None, is_active=None):
    filters = {}
    if connector_id:
        filters['id'] = connector_id
    if is_active is not None:
        filters['is_active'] = is_active
    if connector_name:
        filters['name'] = connector_name
    if connector_type:
        filters['connector_type'] = connector_type
    if connector_type_list:
        filters['connector_type__in'] = connector_type_list
    if not connector_type and not connector_type_list:
        filters['connector_type__in'] = integrations_connector_type_connector_keys_map.keys()
    try:
        return account.connector_set.filter(**filters)
    except Exception as e:
        logger.error(f'Error fetching Connectors: {str(e)}')
        return None


def get_db_connectors(account_id=None, connector_id=None, connector_name=None, connector_type=None,
                      connector_type_list=None, is_active=None):
    filters = {}
    if account_id:
        filters['account_id'] = account_id
    if connector_id:
        filters['id'] = connector_id
    if is_active is not None:
        filters['is_active'] = is_active
    if connector_name:
        filters['name'] = connector_name
    if connector_type:
        filters['connector_type'] = connector_type
    if connector_type_list:
        filters['connector_type__in'] = connector_type_list
    if not connector_type and not connector_type_list:
        filters['connector_type__in'] = integrations_connector_type_connector_keys_map.keys()
    try:
        return Connector.objects.filter(**filters)
    except Exception as e:
        logger.error(f'Error fetching Connectors: {str(e)}')
        return None


def get_db_account_connector_keys(account: Account, connector_id, key_type=None):
    if not connector_id:
        raise ConnectorCrudException('Invalid Connector ID')
    active_connector = get_db_account_connectors(account, connector_id=connector_id, is_active=True)
    if not active_connector.exists():
        raise ConnectorCrudException('Active Connector not found for given ID')
    connector_type = active_connector.first().connector_type
    if not key_type:
        connector_key_types = integrations_connector_type_connector_keys_map.get(connector_type)
        all_key_types = []
        for ckt in connector_key_types:
            all_key_types.extend(ckt)
        all_key_types = list(set(all_key_types))
    else:
        all_key_types = [key_type]
    try:
        return account.connectorkey_set.filter(connector_id=connector_id, key_type__in=all_key_types, is_active=True)
    except Exception as e:
        logger.error(f'Error fetching Connector Keys: {str(e)}')
        raise ConnectorCrudException(f'Error fetching Connector Keys: {str(e)}')


def get_db_connector_keys(account_id, connector_id, key_type=None):
    if not account_id or not connector_id:
        return None, 'Invalid Account/Connector ID'
    active_connector = get_db_connectors(account_id=account_id, connector_id=connector_id, is_active=True)
    if not active_connector.exists():
        return None, 'Active Connector not found for given ID'
    connector_type = active_connector.first().connector_type
    if not key_type:
        connector_key_types = integrations_connector_type_connector_keys_map.get(connector_type)
        all_key_types = []
        for ckt in connector_key_types:
            all_key_types.extend(ckt)
        all_key_types = list(set(all_key_types))
    else:
        all_key_types = [key_type]
    try:
        return ConnectorKey.objects.filter(connector_id=connector_id, key_type__in=all_key_types, is_active=True)
    except Exception as e:
        logger.error(f'Error fetching Connector Keys: {str(e)}')
        return None, f'Error fetching Connector Keys: {str(e)}'


def update_or_create_connector(account: Account, created_by, connector_proto: ConnectorProto,
                               connector_keys: [ConnectorKeyProto], update_mode: bool = False) -> (Connector, str):
    if not connector_proto.type:
        return None, 'Received invalid Connector Config'

    connector_name: str = connector_proto.name.value
    connector_type: ConnectorType = connector_proto.type
    if not connector_name:
        all_c = get_db_account_connectors(account, connector_type=connector_type)
        count = all_c.count()
        connector_name = f'{integrations_connector_type_display_name_map.get(connector_proto.type, connector_proto.type)}_{count + 1}'
    try:
        db_connectors = get_db_account_connectors(account, connector_name=connector_name, connector_type=connector_type)
        if db_connectors.exists() and not update_mode:
            db_connector = db_connectors.first()
            if db_connector.is_active:
                return db_connector, f'Active Connector type ' \
                                     f'{integrations_connector_type_display_name_map.get(connector_type, connector_type)} ' \
                                     f'with name {connector_name} already exists'
            else:
                current_millis = current_milli_time()
                db_connector.name = f'{connector_name}###(inactive)###{current_millis}'
                db_connector.save(update_fields=['name'])
    except ConnectorCrudException as cce:
        return None, str(cce)

    all_ck_types = [ck.key_type for ck in connector_keys]
    required_key_types = integrations_connector_type_connector_keys_map.get(connector_type)
    all_keys_found = False
    for rkt in required_key_types:
        if sorted(rkt) == sorted(list(set(all_ck_types))):
            all_keys_found = True
            break
    if not all_keys_found:
        return None, f'Missing Required Connector Keys for Connector Type: ' \
                     f'{integrations_connector_type_display_name_map.get(connector_type, connector_type)}'

    with dj_transaction.atomic():
        try:
            db_connector, _ = Connector.objects.update_or_create(account=account,
                                                                 name=connector_proto.name.value,
                                                                 connector_type=connector_type,
                                                                 defaults={'is_active': True, 'created_by': created_by})
            for c_key in connector_keys:
                ConnectorKey.objects.update_or_create(account=account,
                                                      connector=db_connector,
                                                      key_type=c_key.key_type,
                                                      key=c_key.key.value,
                                                      defaults={'is_active': True})
        except Exception as e:
            logger.error(f'Error creating Connector: {str(e)}')
            return None, f'Error creating Connector: {str(e)}'
    trigger_connector_metadata_fetch(account, connector_proto, connector_keys)
    return db_connector, None


def test_connection_connector(connector_proto: ConnectorProto, connector_keys: [ConnectorKeyProto]) -> (bool, str):
    if not connector_proto.type:
        return False, 'Received invalid Connector Config'

    connector_type: ConnectorType = connector_proto.type
    all_ck_types = [ck.key_type for ck in connector_keys]
    required_key_types = integrations_connector_type_connector_keys_map.get(connector_type)
    all_keys_found = False
    for rkt in required_key_types:
        if sorted(rkt) == sorted(list(set(all_ck_types))):
            all_keys_found = True
            break
    if not all_keys_found:
        return False, f'Missing Required Connector Keys for Connector Type: ' \
                      f'{integrations_connector_type_display_name_map.get(connector_type, connector_type)}'
    credentials_dict = generate_credentials_dict(connector_type, connector_keys)
    print('credentials_dict', credentials_dict)
    try:
        api_processor = connector_type_api_processor_map.get(connector_type)
        if not api_processor:
            return True, 'Source Test Connection Not Implemented'
        connection_state = False
        if connector_type == ConnectorType.CLOUDWATCH:
            for region in credentials_dict.get('regions', []):
                updated_credentials_dict = credentials_dict.copy()
                updated_credentials_dict.pop('regions', None)
                updated_credentials_dict['client_type'] = 'cloudwatch'
                updated_credentials_dict['region'] = region
                connection_state = api_processor(**updated_credentials_dict).test_connection()
                if not connection_state:
                    break
        elif connector_type == ConnectorType.EKS:
            for region in credentials_dict.get('regions', []):
                updated_credentials_dict = credentials_dict.copy()
                updated_credentials_dict.pop('regions', None)
                updated_credentials_dict['client_type'] = 'eks'
                updated_credentials_dict['region'] = region
                connection_state = api_processor(**updated_credentials_dict).test_connection()
                if not connection_state:
                    break
        elif connector_type == ConnectorType.DATADOG:
            credentials_dict['dd_connector_type'] = ConnectorType.DATADOG
            connection_state = api_processor(**credentials_dict).test_connection()
        elif connector_type == ConnectorType.GRAFANA_VPC:
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
                          f'{integrations_connector_type_display_name_map.get(connector_type, connector_type)}'
    except Exception as e:
        logger.error(f'Error testing connection for Connector Type: {str(e)}')
        return False, f'Error testing connection for Connector Type: ' \
                      f'{integrations_connector_type_display_name_map.get(connector_type, connector_type)} ' \
                      f'with error: {str(e)}'
    return True, 'Source Connection Successful'


def trigger_connector_metadata_fetch(account: Account, connector: ConnectorProto, connector_keys: [ConnectorKeyProto]):
    if not connector or not connector_keys or not connector.id or not connector.id.value or not connector.type:
        logger.error(f'Invalid Connector Config for Metadata Fetch')
        return
    connector_id = connector.id.value
    connector_type: ConnectorType = connector.type
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
                                 f"{integrations_connector_type_display_name_map.get(connector_type, connector_type)} "
                                 f"with error: {e}")
    else:
        logger.error(f'Invalid Credentials for Connector: {connector_id}')
    return
