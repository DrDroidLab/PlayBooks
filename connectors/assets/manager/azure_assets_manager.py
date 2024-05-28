from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssetsModelOptions, \
    AccountConnectorAssets, ConnectorModelTypeOptions
from protos.connectors.assets.azure_asset_pb2 import AzureWorkspaceAssetOptions, AzureAssetModel, \
    AzureWorkspaceAssetModel, AzureAssets
from protos.base_pb2 import Source, SourceModelType


class AzureAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = Source.AZURE

    def get_asset_model_options(self, model_type: SourceModelType, model_uid_metadata_list):
        if model_type == SourceModelType.AZURE_WORKSPACE:
            all_workspaces = []
            for item in model_uid_metadata_list:
                all_workspaces.append(item['model_uid'])
            options = AzureWorkspaceAssetOptions(workspaces=all_workspaces)
            return ConnectorModelTypeOptions(model_type=model_type, azure_workspace_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: SourceModelType,
                               filters: AccountConnectorAssetsModelFiltersProto, azure_models):
        which_one_of = filters.WhichOneof('filters')
        if model_type == SourceModelType.AZURE_WORKSPACE and (
                not which_one_of or which_one_of == 'azure_workspace_model_filters'):
            options: AzureWorkspaceAssetOptions = filters.azure_workspace_model_filters
            filter_workspaces = options.workspaces
            azure_models = azure_models.filter(model_type=SourceModelType.AZURE_WORKSPACE)
            if filter_workspaces:
                azure_models = azure_models.filter(model_uid__in=filter_workspaces)
        azure_asset_protos = []
        for asset in azure_models:
            if asset.model_type == SourceModelType.AZURE_WORKSPACE:
                metadata = asset.metadata
                name = metadata.get('name', asset.model_uid)
                azure_asset_protos.append(AzureAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    azure_workspace=AzureWorkspaceAssetModel(workspace=StringValue(value=asset.model_uid),
                                                             name=StringValue(value=name))))
        return AccountConnectorAssets(azure=AzureAssets(assets=azure_asset_protos))
