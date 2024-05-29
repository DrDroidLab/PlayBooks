from accounts.models import Account
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets
from protos.base_pb2 import Source, SourceModelType


class ConnectorAssetManager:
    source: Source = Source.UNKNOWN

    @classmethod
    def get_asset_model_options(cls, model_type, model_uid_metadata_list):
        pass

    def get_asset_model_values(self, account: Account, model_type: SourceModelType,
                               filters: AccountConnectorAssetsModelFiltersProto, models) -> AccountConnectorAssets:
        pass
