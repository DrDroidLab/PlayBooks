from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.crud.connectors_crud import get_db_account_connectors, get_db_account_connector_keys
from protos.connectors.assets.slack_asset_pb2 import SlackChannelAssetOptions, SlackChannelAssetModel, SlackAssetModel, \
    SlackAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets
from protos.connectors.connector_pb2 import ConnectorMetadataModelType, ConnectorType, ConnectorKey as ConnectorKeyProto


class SlackAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.connector_type = ConnectorType.SLACK

    def get_asset_model_values(self, account: Account, model_type: ConnectorMetadataModelType,
                               filters: AccountConnectorAssetsModelFilters, pg_models):
        which_one_of = filters.WhichOneof('filters')

        channel_protos = []
        slack_connector = get_db_account_connectors(account, connector_type=ConnectorType.SLACK, is_active=True)
        for con in slack_connector:
            try:
                slack_channel_models = get_db_account_connector_keys(account, connector_id=con.id,
                                                                     key_type=ConnectorKeyProto.KeyType.SLACK_CHANNEL)
            except Exception as e:
                slack_channel_models = []
            if model_type == ConnectorMetadataModelType.SLACK_CHANNEL and (
                    not which_one_of or which_one_of == 'slack_channel_model_filters'):
                options: SlackChannelAssetOptions = filters.slack_channel_model_filters
                filter_channels_ids = options.channel_ids
                if filter_channels_ids:
                    slack_channel_models = slack_channel_models.filter(key__in=filter_channels_ids)
            for asset in slack_channel_models:
                metadata = asset.metadata
                channel_id = asset.key
                channel_name = metadata.get('channel_name', '')
                is_auto_rca_enabled = metadata.get('is_auto_rca_enabled', False)
                channel_protos.append(SlackAssetModel(
                    id=UInt64Value(value=asset.id), connector_type=asset.connector.connector_type,
                    type=model_type,
                    last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                        asset.updated_at) else None,
                    slack_channel=SlackChannelAssetModel(
                        channel_id=StringValue(value=channel_id),
                        channel_name=StringValue(value=channel_name),
                        metadata=SlackChannelAssetModel.ChannelMetadata(
                            is_auto_rca_enabled=BoolValue(value=is_auto_rca_enabled)
                        )
                    )))
        return AccountConnectorAssets(slack=SlackAssets(assets=channel_protos))
