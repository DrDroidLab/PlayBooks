from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue, BoolValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from protos.connectors.assets.slack_asset_pb2 import SlackChannelAssetOptions, SlackChannelAssetModel, \
    SlackAssetModel, SlackAssets
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets
from protos.base_pb2 import Source, SourceKeyType, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto


class SlackAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.SLACK
        self.asset_type_callable_map = {
            SourceModelType.SLACK_CHANNEL: {
                'values': self.get_slack_channel_asset_values,
            }
        }

    @staticmethod
    def get_slack_channel_asset_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                                       slack_channel_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'slack_channel_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")
        channel_protos = []

        connector_keys = connector.keys
        slack_channel_keys = []
        for key in connector_keys:
            if key.key_type == SourceKeyType.SLACK_CHANNEL_ID:
                slack_channel_keys.append(key.key.value)

        options: SlackChannelAssetOptions = filters.slack_channel_model_filters
        filter_channels_ids = options.channel_ids
        for filter_channel_id in filter_channels_ids:
            if filter_channel_id in slack_channel_keys:
                slack_channel_keys.remove(filter_channel_id)
        if slack_channel_keys:
            slack_channel_assets = slack_channel_assets.filter(model_uid__in=slack_channel_keys)

        for asset in slack_channel_assets:
            metadata = asset.metadata
            channel_id = asset.model_uid
            channel_name = metadata.get('channel_name', '')
            is_auto_rca_enabled = metadata.get('is_auto_rca_enabled', False)
            channel_protos.append(SlackAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector.connector_type,
                type=SourceModelType.SLACK_CHANNEL,
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
