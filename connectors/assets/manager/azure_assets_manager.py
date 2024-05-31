from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import \
    AccountConnectorAssetsModelFilters as AccountConnectorAssetsModelFiltersProto, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.connectors.assets.azure_asset_pb2 import AzureWorkspaceAssetOptions, AzureAssetModel, \
    AzureWorkspaceAssetModel, AzureAssets
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class AzureAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.AZURE
        self.asset_type_callable_map = {
            SourceModelType.AZURE_WORKSPACE: {
                'options': self.get_azure_workspace_options,
                'values': self.get_azure_workspace_values,
            }
        }

    @staticmethod
    def get_azure_workspace_options(workspace_assets) -> ConnectorModelTypeOptions:
        all_workspaces = []
        for asset in workspace_assets:
            metadata = asset.metadata
            all_workspaces.append(metadata.get('name', asset.model_uid))
        options = AzureWorkspaceAssetOptions(workspaces=all_workspaces)
        return ConnectorModelTypeOptions(model_type=SourceModelType.AZURE_WORKSPACE,
                                         azure_workspace_model_options=options)

    @staticmethod
    def get_azure_workspace_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFiltersProto,
                                   workspace_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'azure_workspace_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")
        options: AzureWorkspaceAssetOptions = filters.azure_workspace_model_filters
        filter_workspaces = options.workspaces
        if filter_workspaces:
            workspace_assets = workspace_assets.filter(metadata__name__in=filter_workspaces)
        azure_asset_protos = []
        for asset in workspace_assets:
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
