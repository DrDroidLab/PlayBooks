from typing import Union
from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from django.http import HttpResponse

from connectors.models import Site

from accounts.models import get_request_account, Account, User, get_request_user
from connectors.assets.utils.playbooks_builder_utils import playbooks_builder_get_connector_sources_options
from connectors.crud.connectors_crud import get_db_account_connectors, create_connector, get_all_available_connectors, \
    get_all_request_connectors, get_connector_keys_options, get_db_account_connector_keys, test_connection_connector
from connectors.crud.connectors_update_processor import connector_update_processor
from connectors.models import Connector
from playbooks.utils.decorators import api_blocked, web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from playbooks.utils.timerange import DateTimeRange, filter_dtr, to_dtr
from protos.base_pb2 import Message, Meta, Page, TimeRange
from protos.connectors.api_pb2 import CreateConnectorRequest, CreateConnectorResponse, GetConnectorsListRequest, \
    GetConnectorsListResponse, GetSlackAlertTriggerOptionsRequest, GetSlackAlertTriggerOptionsResponse, \
    GetSlackAlertsRequest, GetSlackAlertsResponse, GetSlackAppManifestRequest, GetSlackAppManifestResponse, \
    UpdateConnectorRequest, UpdateConnectorResponse, GetConnectorKeysOptionsRequest, \
    GetConnectorKeysOptionsResponse, GetConnectorKeysRequest, GetConnectorKeysResponse, \
    GetConnectorPlaybookSourceOptionsRequest, GetConnectorPlaybookSourceOptionsResponse

from protos.connectors.alert_ops_pb2 import CommWorkspace as CommWorkspaceProto, CommChannel as CommChannelProto, \
    CommAlertType as CommAlertTypeProto, AlertOpsOptions, CommAlertOpsOptions, \
    SlackAlert as SlackAlertProto
from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorType, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


@api_blocked
@web_api(CreateConnectorRequest)
def connectors_create(request_message: CreateConnectorRequest) -> Union[CreateConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    user: User = get_request_user()

    connector: ConnectorProto = request_message.connector
    connector_keys = request_message.connector_keys

    created_by = user.email
    if connector.type in [ConnectorType.GRAFANA_VPC]:
        db_agent_proxy_connector = get_db_account_connectors(account=account, connector_type=ConnectorType.AGENT_PROXY,
                                                             is_active=True)
        if not db_agent_proxy_connector or not db_agent_proxy_connector.exists():
            agent_proxy_vpc_connector_proto = ConnectorProto(type=ConnectorType.AGENT_PROXY)
            db_agent_proxy_connector, err = create_connector(account, created_by, agent_proxy_vpc_connector_proto,
                                                             connector_keys)
            if db_agent_proxy_connector is None and err:
                return CreateConnectorResponse(success=BoolValue(value=False), message=Message(title=err))
    db_connector, err = create_connector(account, created_by, connector, connector_keys)
    if err:
        return CreateConnectorResponse(success=BoolValue(value=False), message=Message(title=err))
    return CreateConnectorResponse(success=BoolValue(value=True))


@web_api(GetConnectorsListRequest)
def connectors_list(request_message: GetConnectorsListRequest) -> Union[GetConnectorsListResponse, HttpResponse]:
    account: Account = get_request_account()
    all_active_connectors = get_db_account_connectors(account, is_active=True)
    all_active_connector_protos = list(x.proto for x in all_active_connectors)
    all_available_connectors = get_all_available_connectors(all_active_connectors)
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
        account_connector = account.connector_set.get(id=connector_id)
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
    account: Account = get_request_account()

    connector_type = request_message.connector_type

    if not connector_type:
        return GetConnectorKeysOptionsResponse(success=BoolValue(value=False),
                                               message=Message(title='Connector Type not found'))

    connector_key_options = get_connector_keys_options(connector_type)
    return GetConnectorKeysOptionsResponse(success=BoolValue(value=True), connector_key_options=connector_key_options)


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
    else:
        connector = connector.first()
    try:
        connector_keys = get_db_account_connector_keys(account, connector_id)
    except Exception as e:
        return GetConnectorKeysResponse(success=BoolValue(value=False), message=Message(title=str(e)))
    connector_key_protos = list(x.get_proto for x in connector_keys)
    return GetConnectorKeysResponse(success=BoolValue(value=True), connector=connector.proto,
                                    connector_keys=connector_key_protos)


@api_blocked
@web_api(CreateConnectorRequest)
def connectors_test_connection(request_message: CreateConnectorRequest) -> Union[CreateConnectorResponse, HttpResponse]:
    connector: ConnectorProto = request_message.connector
    connector_keys = request_message.connector_keys
    connection_state, message = test_connection_connector(connector, connector_keys)
    return CreateConnectorResponse(success=BoolValue(value=connection_state), message=Message(title=message))


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
                                                                                  connector_type=ConnectorType.SLACK,
                                                                                  model_type=ConnectorMetadataModelTypeProto.SLACK_CHANNEL)
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
                   'channel_id',
                   'slack_channel_metadata_model__metadata__channel_name')

    slack_alerts = []
    for a in qs:
        slack_alerts.append(SlackAlertProto(id=UInt64Value(value=a['id']),
                                            alert_type=StringValue(value=a['alert_type']),
                                            alert_title=StringValue(value=a['title']),
                                            alert_text=StringValue(value=a['text']),
                                            slack_channel=CommChannelProto(
                                                id=UInt64Value(value=a['slack_channel_metadata_model__id']),
                                                channel_id=StringValue(value=a['channel_id']),
                                                channel_name=StringValue(
                                                    value=a['slack_channel_metadata_model__metadata__channel_name'])),
                                            alert_timestamp=int(a['data_timestamp'].timestamp())))
    return GetSlackAlertsResponse(meta=get_meta(page=page, total_count=total_count),
                                  slack_alerts=slack_alerts)


@api_blocked
@web_api(GetSlackAppManifestRequest)
def slack_manifest_create(request_message: GetSlackAppManifestRequest) -> \
        Union[GetSlackAppManifestResponse, HttpResponse]:
    account: Account = get_request_account()
    host_name = request_message.host_name

    if not host_name or not host_name.value:
        return GetSlackAppManifestResponse(success=BoolValue(value=False), message=Message(title='Host name not found'))

    # read sample_manifest file string
    sample_manifest = """
        display_information:
            name: MyDroid
            description: App for Automating Investigation & Actions
            background_color: "#1f2126"
        features:
            bot_user:
                display_name: MyDroid
                always_online: true
        oauth_config:
            scopes:
                bot:
                - channels:history
                - chat:write
                - files:write
                - conversations.connect:manage
                - conversations.connect:write
                - groups:write
                - mpim:write
                - im:write
                - channels:manage
                - channels:read
                - groups:read
                - mpim:read
                - im:read
        settings:
            event_subscriptions:
                request_url: HOST_NAME/connectors/handlers/slack_bot/handle_callback_events
                bot_events:
                - message.channels
            org_deploy_enabled: false
            socket_mode_enabled: false
            token_rotation_enabled: false
    """

    app_manifest = sample_manifest.replace("HOST_NAME", host_name.value)

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

    return GetSlackAppManifestResponse(success=BoolValue(value=True), app_manifest=StringValue(value=app_manifest))
