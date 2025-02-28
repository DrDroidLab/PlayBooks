from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager as SourceAssetManager
from protos.connectors.assets.jira_asset_pb2 import JiraProjectAssetOptions, JiraAssetModel, JiraProjectAssetModel, \
    JiraAssets, JiraUserAssetModel, JiraUserAssetOptions
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.assets.asset_pb2 import ConnectorModelTypeOptions, AccountConnectorAssetsModelFilters, \
    AccountConnectorAssets


class JiraAssetManager(SourceAssetManager):

    def __init__(self):
        self.source = Source.JIRA_CLOUD
        self.asset_type_callable_map = {
            SourceModelType.JIRA_PROJECT: {
                'options': self.get_project_options,
                'values': self.get_project_values,
            },
            SourceModelType.JIRA_USER: {
                'options': self.get_user_options,
                'values': self.get_user_values,
            }
        }

    @staticmethod
    def get_project_options(project_assets) -> ConnectorModelTypeOptions:
        all_projects = []
        for asset in project_assets:
            all_projects.append(asset.metadata.get('name', asset.model_uid))
        project_options = JiraProjectAssetOptions(p=all_projects)
        return ConnectorModelTypeOptions(model_type=SourceModelType.JIRA_PROJECT,
                                         jira_project_model_options=project_options)

    @staticmethod
    def get_project_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                           project_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'jira_project_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")
        options: JiraProjectAssetOptions = filters.jira_project_model_filters
        filter_project_names = options.names
        if filter_project_names:
            project_assets = project_assets.filter(metadata__name__in=filter_project_names)

        jira_asset_protos = []
        for asset in project_assets:
            key = asset.model_uid
            metadata = asset.metadata
            project_id = metadata.get('id', None)
            name = metadata.get('name', '')
            self_url = metadata.get('self', '')

            jira_asset_protos.append(JiraAssetModel(
                id=UInt64Value(value=asset.id),
                connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                jira_project=JiraProjectAssetModel(id=StringValue(value=project_id), key=StringValue(value=key),
                                                   name=StringValue(value=name), self_url=StringValue(value=self_url))))

        return AccountConnectorAssets(jira_cloud=JiraAssets(assets=jira_asset_protos))

    @staticmethod
    def get_user_options(user_assets) -> ConnectorModelTypeOptions:
        all_users = []
        for asset in user_assets:
            all_users.append(asset.metadata.get('displayName', asset.model_uid))
        user_options = JiraUserAssetOptions(display_names=all_users)
        return ConnectorModelTypeOptions(model_type=SourceModelType.JIRA_USER,
                                         jira_user_model_options=user_options)

    @staticmethod
    def get_user_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                        user_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'jira_user_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")
        options: JiraUserAssetOptions = filters.jira_user_model_filters
        filter_users = options.display_names
        if filter_users:
            user_assets = user_assets.filter(metadata__displayName__in=filter_users)

        jira_asset_protos = []
        for asset in user_assets:
            account_id = asset.model_uid
            metadata = asset.metadata
            display_name = metadata.get('displayName', '')
            self_url = metadata.get('self', '')

            jira_asset_protos.append(JiraAssetModel(
                id=UInt64Value(value=asset.id),
                connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                jira_user=JiraUserAssetModel(account_id=StringValue(value=account_id),
                                             display_name=StringValue(value=display_name),
                                             self_url=StringValue(value=self_url))))

        return AccountConnectorAssets(jira_cloud=JiraAssets(assets=jira_asset_protos))