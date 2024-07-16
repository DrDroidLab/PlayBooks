import logging
from hashlib import md5

from django.db import transaction as dj_transaction

from accounts.models import Account
from connectors.models import Connector, ConnectorKey, integrations_connector_type_connector_keys_map, \
    integrations_connector_type_display_name_map
from connectors.utils import trigger_connector_metadata_fetch
from protos.base_pb2 import Source, SourceKeyType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from utils.time_utils import current_milli_time

logger = logging.getLogger(__name__)


class ConnectorCrudException(ValueError):
    pass


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


def get_db_account_connector_connected_playbooks(account: Account, connector_id=None):
    filters = {}
    if connector_id:
        filters['id'] = connector_id
    try:
        connectors = account.connector_set.filter(**filters)
        if connectors.exists():
            connector = connectors.first()
            connected_playbooks = connector.playbooksteptaskconnectormapping_set.filter(is_active=True)
            connected_playbooks = connected_playbooks.select_related('playbook')
            connected_playbooks = connected_playbooks.values('playbook_id', 'playbook__name')
            return connected_playbooks
    except Exception as e:
        logger.error(f'Error fetching Connectors: {str(e)}')
    return None


def update_or_create_connector(account: Account, created_by, connector_proto: ConnectorProto,
                               connector_keys: [SourceKeyType], update_mode: bool = False) -> (Connector, str):
    if not connector_proto.type:
        return None, 'Received invalid Connector Config'

    connector_name: str = connector_proto.name.value
    connector_type: Source = connector_proto.type
    db_connectors = get_db_account_connectors(account, connector_type=connector_type)
    if not connector_name and not update_mode:
        count = db_connectors.count()
        connector_name = f'{integrations_connector_type_display_name_map.get(connector_proto.type, Source.Name(connector_proto.type))}-{count + 1}'
    try:
        db_connectors = db_connectors.filter(name=connector_name)
        if db_connectors.exists() and not update_mode:
            db_connector = db_connectors.first()
            if db_connector.is_active:
                return db_connector, f'Active Connector type ' \
                                     f'{integrations_connector_type_display_name_map.get(connector_type, Source.Name(connector_type))} ' \
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
        return None, f'Missing Required Connector Keys for Connector Type: {connector_name}'

    with dj_transaction.atomic():
        try:
            db_connector, _ = Connector.objects.update_or_create(account=account,
                                                                 name=connector_name,
                                                                 connector_type=connector_type,
                                                                 defaults={'is_active': True, 'created_by': created_by})
            for c_key in connector_keys:
                key_md5 = md5(str(c_key.key.value).encode('utf-8')).hexdigest()
                ConnectorKey.objects.update_or_create(account=account,
                                                      connector=db_connector,
                                                      key_type=c_key.key_type,
                                                      key_md5=key_md5,
                                                      defaults={'is_active': True,
                                                                'key': c_key.key.value
                                                                }
                                                      )
        except Exception as e:
            logger.error(f'Error creating Connector: {str(e)}')
            return None, f'Error creating Connector: {str(e)}'
    trigger_connector_metadata_fetch(account, db_connector.unmasked_proto, connector_keys)
    return db_connector, None
