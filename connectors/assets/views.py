import logging
from typing import Union

from django.http import HttpResponse
from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import Account, get_request_account
from connectors.assets.manager.asset_manager_facade import asset_manager_facade
from connectors.crud.connectors_crud import get_db_account_connectors
from connectors.models import integrations_connector_type_connector_keys_map
from connectors.utils import trigger_connector_metadata_fetch
from playbooks.utils.decorators import web_api
from protos.base_pb2 import Message
from protos.connectors.assets.api_pb2 import GetConnectorsAssetsModelsOptionsRequest, \
    GetConnectorsAssetsModelsOptionsResponse, GetConnectorsAssetsModelsRequest, GetConnectorsAssetsModelsResponse, \
    GetConnectorsAssetsModelsRefreshRequest, GetConnectorsAssetsModelsRefreshResponse
from protos.connectors.connector_pb2 import Connector as ConnectorProto

logger = logging.getLogger(__name__)


@web_api(GetConnectorsAssetsModelsOptionsRequest)
def assets_models_options(request_message: GetConnectorsAssetsModelsOptionsRequest) -> \
        Union[GetConnectorsAssetsModelsOptionsResponse, HttpResponse]:
    account: Account = get_request_account()
    connector_type = request_message.connector_type
    if not connector_type:
        return GetConnectorsAssetsModelsOptionsResponse(success=BoolValue(value=False),
                                                        message=Message(title="Invalid Request",
                                                                        description="Missing connector_type"))
    asset_model_options = asset_manager_facade.get_asset_model_options(account, request_message.connector_type,
                                                                       request_message.model_type)
    return GetConnectorsAssetsModelsOptionsResponse(success=BoolValue(value=True),
                                                    asset_model_options=asset_model_options)


@web_api(GetConnectorsAssetsModelsRequest)
def assets_models_get(request_message: GetConnectorsAssetsModelsRequest) -> \
        Union[GetConnectorsAssetsModelsResponse, HttpResponse]:
    account: Account = get_request_account()
    if not request_message.connector_type:
        return GetConnectorsAssetsModelsResponse(success=BoolValue(value=False),
                                                 message=Message(title="Invalid Request",
                                                                 description="Missing connector_type"))
    try:
        account_connector_assets = asset_manager_facade.get_asset_model_values(account, request_message.connector_type,
                                                                               request_message.type,
                                                                               request_message.filters)
    except Exception as err:
        return GetConnectorsAssetsModelsResponse(success=BoolValue(value=False),
                                                 message=Message(title="Error", description=str(err)))
    return GetConnectorsAssetsModelsResponse(success=BoolValue(value=True), assets=account_connector_assets)


@web_api(GetConnectorsAssetsModelsRefreshRequest)
def assets_models_refresh(request_message: GetConnectorsAssetsModelsRefreshRequest) -> \
        Union[GetConnectorsAssetsModelsRefreshResponse, HttpResponse]:
    account: Account = get_request_account()
    connector_id = request_message.connector_id
    if not connector_id or not connector_id.value:
        return GetConnectorsAssetsModelsRefreshResponse(success=BoolValue(value=False),
                                                        message=Message(title="Invalid Request",
                                                                        description="Missing connector details"))
    db_connectors = get_db_account_connectors(account, connector_id)
    if not db_connectors.exists() or not db_connectors:
        return GetConnectorsAssetsModelsRefreshResponse(success=BoolValue(value=False),
                                                        message=Message(title="Invalid Request",
                                                                        description="Connector not found"))
    db_connector = db_connectors.first()
    connector_proto: ConnectorProto = db_connector.unmasked_proto
    connector_keys_proto = connector_proto.keys
    all_ck_types = [ck.key_type for ck in connector_keys_proto]
    required_key_types = integrations_connector_type_connector_keys_map.get(connector_proto.type, [])
    all_keys_found = False
    for rkt in required_key_types:
        if sorted(rkt) == sorted(all_ck_types):
            all_keys_found = True
            break
    if not all_keys_found:
        return GetConnectorsAssetsModelsRefreshResponse(success=BoolValue(value=False),
                                                        message=Message(title="Invalid Request",
                                                                        description="Missing required connector keys"))

    trigger_connector_metadata_fetch(account, connector_proto, connector_keys_proto)
    return GetConnectorsAssetsModelsRefreshResponse(success=BoolValue(value=True))
