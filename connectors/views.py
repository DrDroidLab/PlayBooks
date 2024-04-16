from typing import Union

from django.http import HttpResponse

from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import get_request_account, Account, User, get_request_user
from connectors.crud.connectors_crud import get_db_connectors, create_connector, get_all_available_connectors, \
    get_all_request_connectors, get_connector_keys_options, get_db_connector_keys
from connectors.crud.connectors_update_processor import connector_update_processor
from connectors.models import Connector
from playbooks.utils.decorators import web_api
from protos.base_pb2 import Message
from protos.connectors.api_pb2 import CreateConnectorRequest, CreateConnectorResponse, GetConnectorsListRequest, \
    GetConnectorsListResponse, UpdateConnectorRequest, UpdateConnectorResponse, GetConnectorKeysOptionsRequest, \
    GetConnectorKeysOptionsResponse, GetConnectorKeysRequest, GetConnectorKeysResponse
from protos.connectors.connector_pb2 import Connector as ConnectorProto, ConnectorType


@web_api(CreateConnectorRequest)
def connectors_create(request_message: CreateConnectorRequest) -> Union[CreateConnectorResponse, HttpResponse]:
    account: Account = get_request_account()
    user: User = get_request_user()

    connector: ConnectorProto = request_message.connector
    connector_keys = request_message.connector_keys

    created_by = user.email
    if connector.type in [ConnectorType.GRAFANA_VPC]:
        db_agent_proxy_connector = get_db_connectors(account=account, connector_type=ConnectorType.AGENT_PROXY,
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
    all_active_connectors = get_db_connectors(account, is_active=True)
    all_active_connector_protos = list(x.proto for x in all_active_connectors)
    all_available_connectors = get_all_available_connectors(all_active_connectors)
    all_request_connectors = get_all_request_connectors()
    return GetConnectorsListResponse(success=BoolValue(value=True),
                                     request_connectors=all_request_connectors,
                                     available_connectors=all_available_connectors,
                                     connectors=all_active_connector_protos)


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

    connector = get_db_connectors(account, connector_id=connector_id, is_active=True)
    if not connector:
        return GetConnectorKeysResponse(success=BoolValue(value=False),
                                        message=Message(title='Active Connector not found'))
    else:
        connector = connector.first()
    connector_keys, err = get_db_connector_keys(account, connector_id)
    if err:
        return GetConnectorKeysResponse(success=BoolValue(value=False), message=Message(title=err))
    connector_key_protos = list(x.get_proto for x in connector_keys)
    return GetConnectorKeysResponse(success=BoolValue(value=True), connector=connector.proto,
                                    connector_keys=connector_key_protos)
