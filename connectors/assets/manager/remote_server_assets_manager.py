from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    AccountConnectorAssetsModelOptions
from protos.connectors.assets.remote_server_asset_pb2 import SshServerAssetOptions, RemoteServerAssetModel, \
    SshServerAssetModel, RemoteServerAssets
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class RemoteServetAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorType.SLACK

    def get_asset_model_options(self, model_type: ConnectorMetadataModelTypeProto, model_uid_metadata_list):
        if model_type == ConnectorMetadataModelTypeProto.SSH_SERVER:
            all_servers = []
            for item in model_uid_metadata_list:
                all_servers.append(item['model_uid'])
            options = SshServerAssetOptions(ssh_servers=all_servers)
            return AccountConnectorAssetsModelOptions.ModelTypeOption(model_type=model_type,
                                                                      ssh_server_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelTypeProto,
                               filters: AccountConnectorAssetsModelFilters, rm_models):
        which_one_of = filters.WhichOneof('filters')
        if model_type == ConnectorMetadataModelTypeProto.SSH_SERVER and (
                not which_one_of or which_one_of == 'ssh_server_model_filters'):
            options: SshServerAssetOptions = filters.ssh_server_model_filters
            filter_servers = options.ssh_servers
            rm_models = rm_models.filter(model_type=ConnectorMetadataModelTypeProto.SSH_SERVER)
            if filter_servers:
                rm_models = rm_models.filter(model_uid__in=filter_servers)
        rm_asset_protos = []
        for asset in rm_models:
            if asset.model_type == ConnectorMetadataModelTypeProto.SSH_SERVER:
                rm_asset_protos.append(RemoteServerAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    ssh_server=SshServerAssetModel(name=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(remote_server=RemoteServerAssets(assets=rm_asset_protos))
