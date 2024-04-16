from accounts.models import Account
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class ConnectorAssetManager:
    connector_type: ConnectorTypeProto = ConnectorTypeProto.UNKNOWN

    @classmethod
    def get_asset_model_options(cls, model_type, model_uid_metadata_list):
        pass

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFiltersProto, models) -> AccountConnectorAssets:
        pass
