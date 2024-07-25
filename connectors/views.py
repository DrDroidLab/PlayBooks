import logging
from typing import Union

from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from django.http import HttpResponse, JsonResponse

from executor.playbook_source_facade import playbook_source_facade
from utils.uri_utils import build_absolute_uri

from connectors.models import Site, ConnectorMetadataModelStore, integrations_connector_type_connector_keys_map

from accounts.models import get_request_account, Account, User, get_request_user
from executor.utils.playbooks_builder_utils import playbooks_builder_get_connector_sources_options
from connectors.crud.connectors_crud import get_db_account_connectors, update_or_create_connector, \
    get_db_account_connector_connected_playbooks
from connectors.crud.connectors_update_processor import connector_update_processor
from connectors.models import Connector
from connectors.utils import get_all_available_connectors, get_all_request_connectors, \
    get_connector_keys_options
from playbooks.utils.decorators import api_blocked, web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from playbooks.utils.timerange import DateTimeRange, filter_dtr, to_dtr
from protos.base_pb2 import Message, Meta, Page, TimeRange, SourceKeyType
from protos.connectors.api_pb2 import CreateConnectorRequest, CreateConnectorResponse, GetConnectorsListRequest, \
    GetConnectorsListResponse, GetSlackAlertTriggerOptionsRequest, GetSlackAlertTriggerOptionsResponse, \
    GetSlackAlertsRequest, GetSlackAlertsResponse, GetSlackAppManifestRequest, GetSlackAppManifestResponse, \
    UpdateConnectorRequest, UpdateConnectorResponse, GetConnectorKeysOptionsRequest, \
    GetConnectorKeysOptionsResponse, GetConnectorKeysRequest, GetConnectorKeysResponse, \
    GetConnectorPlaybookSourceOptionsRequest, GetConnectorPlaybookSourceOptionsResponse, GetConnectedPlaybooksRequest, \
    GetConnectedPlaybooksResponse, GetConnectorRequest, GetConnectorResponse

from protos.connectors.alert_ops_pb2 import CommWorkspace as CommWorkspaceProto, CommChannel as CommChannelProto, \
    CommAlertType as CommAlertTypeProto, AlertOpsOptions, CommAlertOpsOptions, \
    SlackAlert as SlackAlertProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from utils.proto_utils import dict_to_proto

logger = logging.getLogger(__name__)


@api_blocked
@web_api(CreateConnectorRequest)
def connectors_create(request_message: CreateConnectorRequest) -> Union[CreateConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    user: User = get_request_user()

    connector: ConnectorProto = request_message.connector
    connector_keys = request_message.connector_keys

    created_by = user.email
    if connector.type in [Source.GRAFANA_VPC]:
        db_agent_proxy_connector = get_db_account_connectors(account=account, connector_type=Source.AGENT_PROXY,
                                                             is_active=True)
        if not db_agent_proxy_connector or not db_agent_proxy_connector.exists():
            agent_proxy_vpc_connector_proto = ConnectorProto(type=Source.AGENT_PROXY)
            db_agent_proxy_connector, err = update_or_create_connector(account, created_by,
                                                                       agent_proxy_vpc_connector_proto,
                                                                       connector_keys)
            if db_agent_proxy_connector is None and err:
                return CreateConnectorResponse(success=BoolValue(value=False), message=Message(title=err))

    connector_metadata_models = []
    if connector.type == Source.BASH:
        for key in connector_keys:
            if key.key_type == SourceKeyType.REMOTE_SERVER_HOST:
                ssh_servers = key.key.value
                ssh_servers = ssh_servers.replace(' ', '')
                ssh_servers = ssh_servers.split(',')
                ssh_servers = list(filter(None, ssh_servers))
                for ssh_server in ssh_servers:
                    if '@' not in ssh_server:
                        return CreateConnectorResponse(success=BoolValue(value=False), message=Message(
                            title='Invalid Remote Server Host. Please provide in the format user@host'))
                    connector_metadata_models.append(
                        {'model_type': SourceModelType.SSH_SERVER, 'model_uid': ssh_server, 'is_active': True,
                         'connector_type': Source.BASH})
                break
    db_connector, err = update_or_create_connector(account, created_by, connector, connector_keys)
    for c in connector_metadata_models:
        try:
            ConnectorMetadataModelStore.objects.update_or_create(account=db_connector.account,
                                                                 connector=db_connector,
                                                                 connector_type=c['connector_type'],
                                                                 model_type=c['model_type'],
                                                                 model_uid=c['model_uid'],
                                                                 defaults={'is_active': True, 'metadata': None})
        except Exception as e:
            logger.error(f"Failed to create connector metadata model: {str(e)}")
            continue
    if err:
        return CreateConnectorResponse(success=BoolValue(value=False), message=Message(title=err))
    return CreateConnectorResponse(success=BoolValue(value=True))


@web_api(GetConnectorRequest)
def connectors_get(request_message: GetConnectorRequest) -> Union[GetConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    connector_id = request_message.connector_id
    if not connector_id or not connector_id.value:
        return GetConnectorResponse(success=BoolValue(value=False), message=Message(title='Connector ID not found'))

    db_connector = get_db_account_connectors(account=account, connector_id=connector_id.value, is_active=True)
    if not db_connector or not db_connector.exists():
        return GetConnectorResponse(success=BoolValue(value=False), message=Message(title='Connector not found'))
    return GetConnectorResponse(success=BoolValue(value=True), connector=db_connector.first().proto)


@web_api(GetConnectorsListRequest)
def connectors_list(request_message: GetConnectorsListRequest) -> Union[GetConnectorsListResponse, HttpResponse]:
    account: Account = get_request_account()
    if request_message.connector_type:
        all_active_connectors = get_db_account_connectors(account, is_active=True,
                                                          connector_type=request_message.connector_type)
        all_active_connector_protos = list(x.proto for x in all_active_connectors)
    else:
        all_active_connectors = get_db_account_connectors(account, is_active=True)
        all_active_connector_protos = list(x.proto_partial for x in all_active_connectors)
    all_available_connectors = get_all_available_connectors()
    all_request_connectors = get_all_request_connectors()
    return GetConnectorsListResponse(success=BoolValue(value=True),
                                     request_connectors=all_request_connectors,
                                     available_connectors=all_available_connectors,
                                     connectors=all_active_connector_protos)


@api_blocked
@web_api(UpdateConnectorRequest)
def connectors_update(request_message: UpdateConnectorRequest) -> Union[UpdateConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    connector_id = request_message.connector_id.value
    update_connector_ops = request_message.update_connector_ops
    if not connector_id or not update_connector_ops:
        return UpdateConnectorResponse(success=BoolValue(value=False),
                                       message=Message(title="Invalid Request", description="Missing playbook_id/ops"))
    try:
        account_connectors = get_db_account_connectors(account, connector_id=connector_id)
        if not account_connectors.exists():
            return UpdateConnectorResponse(success=BoolValue(value=False),
                                           message=Message(title="Connector not found"))
        account_connector = account_connectors.first()
        updated_connector = connector_update_processor.update(account_connector, update_connector_ops), None
    except Connector.DoesNotExist:
        return UpdateConnectorResponse(success=BoolValue(value=False), message=Message(title='Connector not found'))
    except Exception as e:
        return UpdateConnectorResponse(success=BoolValue(value=False), message=Message(title=str(e)))
    if not updated_connector:
        return UpdateConnectorResponse(success=BoolValue(value=False),
                                       message=Message(title='Failed to update connector'))
    return UpdateConnectorResponse(success=BoolValue(value=True))


@web_api(GetConnectorKeysOptionsRequest)
def connector_keys_options(request_message: GetConnectorKeysOptionsRequest) -> \
        Union[GetConnectorKeysOptionsResponse, HttpResponse]:
    connector_type = request_message.connector_type

    if not connector_type:
        return GetConnectorKeysOptionsResponse(success=BoolValue(value=False),
                                               message=Message(title='Connector Type not found'))

    connector, connector_key_options = get_connector_keys_options(connector_type)
    return GetConnectorKeysOptionsResponse(success=BoolValue(value=True), connector=connector,
                                           connector_key_options=connector_key_options)


@web_api(GetConnectorKeysRequest)
def connector_keys_get(request_message: GetConnectorKeysRequest) -> Union[GetConnectorKeysResponse, HttpResponse]:
    account: Account = get_request_account()

    connector_id = request_message.connector_id.value

    if not connector_id:
        return GetConnectorKeysResponse(success=BoolValue(value=False), message=Message(title='Connector ID not found'))

    connector = get_db_account_connectors(account, connector_id=connector_id, is_active=True)
    if not connector:
        return GetConnectorKeysResponse(success=BoolValue(value=False),
                                        message=Message(title='Active Connector not found'))

    connector = connector.first()
    connector_proto = connector.proto
    connector_key_protos = connector_proto.keys
    return GetConnectorKeysResponse(success=BoolValue(value=True), connector=connector.proto,
                                    connector_keys=connector_key_protos)


@api_blocked
@web_api(CreateConnectorRequest)
def connectors_test_connection(request_message: CreateConnectorRequest) -> Union[CreateConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    connector: ConnectorProto = request_message.connector
    if not connector:
        return CreateConnectorResponse(success=BoolValue(value=False),
                                       message=Message(title='Connector details not found'))
    if connector.id and connector.id.value:
        connector_id = connector.id.value
        db_connectors = get_db_account_connectors(account, connector_id=connector_id)
        if not db_connectors.exists():
            return CreateConnectorResponse(success=BoolValue(value=False),
                                           message=Message(title='Connector not found'))
        db_connector = db_connectors.first()
        connector = db_connector.unmasked_proto
    elif request_message.connector_keys:
        connector_keys = request_message.connector_keys
        connector.keys.extend(connector_keys)
    else:
        return CreateConnectorResponse(success=BoolValue(value=False),
                                       message=Message(title='Connector keys not found'))
    all_keys_found = False
    all_ck_types = [ck.key_type for ck in connector.keys]
    required_key_types = integrations_connector_type_connector_keys_map.get(connector.type, [])
    for rkt in required_key_types:
        if sorted(rkt) == sorted(list(set(all_ck_types))):
            all_keys_found = True
            break
    if not all_keys_found:
        return CreateConnectorResponse(success=BoolValue(value=False),
                                       message=Message(title='Missing Required Connector Keys',
                                                       description='Please provide all required keys'))
    connection_state, err = playbook_source_facade.test_source_connection(connector)
    if err is not None:
        return CreateConnectorResponse(success=BoolValue(value=False), message=Message(title=err))
    if connection_state:
        return CreateConnectorResponse(success=BoolValue(value=connection_state),
                                       message=Message(title='Source Connection Successful'))
    else:
        return CreateConnectorResponse(success=BoolValue(value=connection_state),
                                       message=Message(title='Source Connection Failed'))


@web_api(GetConnectorPlaybookSourceOptionsRequest)
def playbooks_sources_options(request_message: GetConnectorPlaybookSourceOptionsRequest) -> \
        Union[GetConnectorPlaybookSourceOptionsResponse, HttpResponse]:
    account: Account = get_request_account()
    account_active_connector_types = playbooks_builder_get_connector_sources_options(account)
    return GetConnectorPlaybookSourceOptionsResponse(success=BoolValue(value=True),
                                                     active_account_connectors=account_active_connector_types)


@web_api(GetSlackAlertTriggerOptionsRequest)
def slack_alert_trigger_options_get(request_message: GetSlackAlertTriggerOptionsRequest) -> \
        Union[GetSlackAlertTriggerOptionsResponse, HttpResponse]:
    account: Account = get_request_account()

    connector_type_requests = request_message.connector_type_requests
    if not connector_type_requests:
        return GetSlackAlertTriggerOptionsResponse()

    comm_workspaces = []
    for connector_type_request in connector_type_requests:
        connector_type = connector_type_request.connector_type
        active_connectors = account.connector_set.filter(connector_type=connector_type, is_active=True)
        if not active_connectors:
            continue

        for connector in active_connectors:
            active_channels = []
            active_comm_channels = account.connectormetadatamodelstore_set.filter(connector=connector, is_active=True,
                                                                                  connector_type=Source.SLACK,
                                                                                  model_type=SourceModelType.SLACK_CHANNEL)
            active_comm_channels_id = []
            for channel in active_comm_channels:
                channel_name = None
                if channel.metadata and channel.metadata.get('channel_name', False):
                    channel_name = channel.metadata['channel_name']
                channel_id = channel.model_uid
                active_comm_channels_id.append(channel.model_uid)
                active_channels.append(
                    CommChannelProto(id=UInt64Value(value=channel.id), channel_id=StringValue(value=channel_id),
                                     channel_name=StringValue(value=channel_name)))

            alert_type_protos = []
            alert_types = account.slackconnectoralerttype_set.filter(connector=connector,
                                                                     channel_id__in=active_comm_channels_id).values(
                'id',
                'alert_type',
                'channel_id')
            for alert_type in alert_types:
                alert_type_protos.append(CommAlertTypeProto(id=UInt64Value(value=alert_type['id']),
                                                            channel_id=StringValue(
                                                                value=alert_type['channel_id']),
                                                            alert_type=StringValue(value=alert_type['alert_type'])))
            comm_workspaces.append(
                CommWorkspaceProto(id=UInt64Value(value=connector.id), name=StringValue(value=connector.name),
                                   active_channels=active_channels, alert_types=alert_type_protos))

    return GetSlackAlertTriggerOptionsResponse(
        alert_ops_options=AlertOpsOptions(comm_options=CommAlertOpsOptions(workspaces=comm_workspaces)))


@web_api(GetSlackAlertsRequest)
def slack_alerts_search(request_message: GetSlackAlertsRequest) -> \
        Union[GetSlackAlertsResponse, HttpResponse]:
    account: Account = get_request_account()
    meta: Meta = request_message.meta
    tr: TimeRange = meta.time_range
    dtr: DateTimeRange = to_dtr(tr)
    page: Page = meta.page
    qs = account.slackconnectordatareceived_set.all()
    if request_message.pattern and request_message.pattern.value:
        qs = qs.filter(text__icontains=request_message.pattern.value)
    if request_message.workspace_id and request_message.workspace_id.value:
        qs = qs.filter(connector_id=request_message.workspace_id.value)
    if request_message.channel_id and request_message.channel_id.value:
        qs = qs.filter(channel_id=request_message.channel_id.value)
    if request_message.alert_type and request_message.alert_type.value:
        qs = qs.filter(alert_type=request_message.alert_type.value)
    qs = qs.order_by('-data_timestamp')
    qs = qs.select_related('slack_channel_metadata_model')
    qs = filter_dtr(qs, dtr, 'data_timestamp')
    total_count = qs.count()
    qs = filter_page(qs, page)
    qs = qs.values('id', 'alert_type', 'title', 'text', 'data_timestamp', 'slack_channel_metadata_model__id',
                   'channel_id', 'data',
                   'slack_channel_metadata_model__metadata__channel_name')

    slack_alerts = []
    for a in qs:
        data_struct = dict_to_proto(a['data'], Struct)
        slack_alerts.append(SlackAlertProto(id=UInt64Value(value=a['id']),
                                            alert_type=StringValue(value=a['alert_type']),
                                            alert_title=StringValue(value=a['title']),
                                            alert_text=StringValue(value=a['text']),
                                            slack_channel=CommChannelProto(
                                                id=UInt64Value(value=a['slack_channel_metadata_model__id']),
                                                channel_id=StringValue(value=a['channel_id']),
                                                channel_name=StringValue(
                                                    value=a['slack_channel_metadata_model__metadata__channel_name'])),
                                            alert_timestamp=int(a['data_timestamp'].timestamp()),
                                            alert_json=data_struct))
    return GetSlackAlertsResponse(meta=get_meta(page=page, total_count=total_count),
                                  slack_alerts=slack_alerts)


@api_blocked
@web_api(GetSlackAppManifestRequest)
def save_site_url(request_message: GetSlackAppManifestRequest) -> \
        Union[GetSlackAppManifestResponse, HttpResponse]:
    account: Account = get_request_account()
    host_name = request_message.host_name

    site_domain = host_name.value.replace('https://', '').replace('http://', '').split("/")[0]
    active_sites = Site.objects.filter(is_active=True)
    http_protocol = 'https' if host_name.value.startswith('https://') else 'http'

    if active_sites:
        site = active_sites.first()
        site.domain = site_domain
        site.name = 'MyDroid'
        site.protocol = http_protocol
        site.save()
    else:
        Site.objects.create(domain=site_domain, name='MyDroid', protocol=http_protocol, is_active=True)
    return GetSlackAppManifestResponse(success=BoolValue(value=True))


@web_api(GetSlackAppManifestRequest)
def get_site_url(request_message) -> JsonResponse:
    url = build_absolute_uri(None, "", "", True)

    return JsonResponse({"url": url}, status=200)


@web_api(GetConnectedPlaybooksRequest)
def connected_playbooks_get(request_message: GetConnectedPlaybooksRequest) -> \
        Union[GetConnectedPlaybooksResponse, HttpResponse]:
    account: Account = get_request_account()
    if not request_message.connector_id or not request_message.connector_id.value:
        return GetConnectedPlaybooksResponse(success=BoolValue(value=False),
                                             message=Message(title='Connector ID not found'))
    connector_id = request_message.connector_id.value
    connected_playbooks = get_db_account_connector_connected_playbooks(account, connector_id)

    connected_playbooks_proto: [GetConnectedPlaybooksResponse.Playbook] = []
    for cp in connected_playbooks:
        connected_playbooks_proto.append(
            GetConnectedPlaybooksResponse.Playbook(playbook_id=UInt64Value(value=cp['playbook_id']),
                                                   playbook_name=StringValue(value=cp['playbook__name'])))
    return GetConnectedPlaybooksResponse(success=BoolValue(value=True), connected_playbooks=connected_playbooks_proto)
