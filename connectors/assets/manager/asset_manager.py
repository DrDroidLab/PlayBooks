import logging

from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    AccountConnectorAssetsModelOptions, ConnectorModelTypeOptions
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from utils.proto_utils import proto_to_dict, dict_to_proto

logger = logging.getLogger(__name__)


def get_model_type_asset_model_map(assets):
    model_type_asset_map = {}
    for asset in assets:
        if asset.model_type not in model_type_asset_map:
            model_type_asset_map[asset.model_type] = []
        model_type_asset_map[asset.model_type].append(asset)
    return model_type_asset_map


class ConnectorAssetManager:
    source: Source = Source.UNKNOWN
    asset_type_callable_map = {}

    @staticmethod
    def get_connector_asset_proto(connector, assets):
        asset_values = []
        asset_key = ''
        for asset in assets:
            asset_dict = proto_to_dict(asset)
            for k, v in asset_dict.items():
                if not asset_key:
                    asset_key = k
                elif asset_key != k:
                    raise ValueError(f"Asset key mismatch: {asset_key} != {k}")
                asset_values.extend(v.get('assets', []))

        connector_dict = proto_to_dict(connector)
        connector_dict.pop('keys', None)
        connector_asset_dict = {
            'connector': connector_dict,
            asset_key: {'assets': asset_values},
        }
        return dict_to_proto(connector_asset_dict, AccountConnectorAssets)

    def get_asset_model_options(self, connector: ConnectorProto, model_types: [SourceModelType]) -> \
            AccountConnectorAssetsModelOptions:
        try:
            if not connector or not model_types:
                raise ValueError("Connector and model types are required to fetch asset options")

            if not connector.type or connector.type != self.source:
                raise ValueError(f"Connector type {connector.type} does not match with source {self.source}")

            if not self.asset_type_callable_map:
                logger.error("Asset type callable map not found")
                return AccountConnectorAssetsModelOptions()

            connector_model_type_options: [ConnectorModelTypeOptions] = []
            all_connector_assets = get_db_connector_metadata_models(account_id=connector.account_id.value,
                                                                    connector_id=connector.id.value,
                                                                    model_types=model_types,
                                                                    is_active=True)

            model_type_asset_map = get_model_type_asset_model_map(all_connector_assets)

            for model_type, assets in model_type_asset_map.items():
                if model_type not in self.asset_type_callable_map:
                    logger.error(f"No asset manager found for model type: {model_type}")
                    continue
                connector_model_type_options.append(self.asset_type_callable_map[model_type]['options'](assets))

            return AccountConnectorAssetsModelOptions(connector_type=self.source,
                                                      connector=connector,
                                                      model_types_options=connector_model_type_options)
        except Exception as e:
            raise ValueError(f"Error while fetching asset options: {str(e)}")

    def get_asset_model_values(self, connector: ConnectorProto, model_type: SourceModelType,
                               asset_filter: AccountConnectorAssetsModelFilters) -> AccountConnectorAssets:
        try:
            if not connector:
                raise ValueError("Connector and model type are required to fetch asset values")

            if not connector.type or connector.type != self.source:
                raise ValueError(f"Connector type {connector.type} does not match with source {self.source}")

            if not self.asset_type_callable_map:
                logger.error("Asset type callable map not found")
                return AccountConnectorAssets()

            assets = get_db_connector_metadata_models(account_id=connector.account_id.value,
                                                      connector_id=connector.id.value,
                                                      model_type=model_type,
                                                      is_active=True)

            if model_type:
                model_type_asset_map = {model_type: assets}
            else:
                model_type_asset_map = get_model_type_asset_model_map(assets)

            all_asset_protos = []
            for model_type, assets in model_type_asset_map.items():
                if model_type not in self.asset_type_callable_map:
                    logger.error(f"No asset manager found for model type: {model_type}")
                    continue
                values = self.asset_type_callable_map[model_type]['values'](connector, asset_filter, assets)
                all_asset_protos.append(values)
            return self.get_connector_asset_proto(connector, all_asset_protos)
        except Exception as e:
            raise ValueError(f"Error while fetching asset options: {str(e)}")
