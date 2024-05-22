from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.connectors.assets.remote_server_asset_pb2 import SshServerAssetOptions, RemoteServerAssetModel, \
    SshServerAssetModel, RemoteServerAssets
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class RemoteServetAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.SLACK
        self.asset_type_callable_map = {
            SourceModelType.SSH_SERVER: {
                'options': self.get_ssh_server_asset_options,
                'values': self.get_ssh_server_asset_values,
            }
        }

    @staticmethod
    def get_ssh_server_asset_options(ssh_server_assets):
        all_servers = []
        for asset in ssh_server_assets:
            all_servers.append(asset.model_uid)
        options = SshServerAssetOptions(ssh_servers=all_servers)
        return ConnectorModelTypeOptions(model_type=SourceModelType.SSH_SERVER, ssh_server_model_options=options)

    @staticmethod
    def get_ssh_server_asset_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                                    ssh_server_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'ssh_server_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: SshServerAssetOptions = filters.ssh_server_model_filters
        filter_servers = options.ssh_servers
        if filter_servers:
            ssh_server_assets = ssh_server_assets.filter(model_uid__in=filter_servers)
        rm_asset_protos = []
        for asset in ssh_server_assets:
            if asset.model_type == SourceModelType.SSH_SERVER:
                rm_asset_protos.append(RemoteServerAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                    type=asset.model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    ssh_server=SshServerAssetModel(name=StringValue(value=asset.model_uid))))
        return AccountConnectorAssets(connector=connector, remote_server=RemoteServerAssets(assets=rm_asset_protos))
