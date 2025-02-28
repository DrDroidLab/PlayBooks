from datetime import datetime, timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue

from connectors.assets.manager.asset_manager import ConnectorAssetManager as SourceAssetManager
from protos.connectors.assets.argocd_asset_pb2 import ArgoCDAppsAssetOptions, ArgoCDAppsAssetModel, \
    ArgoCDAssets, ArgoCDAssetModel
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.assets.asset_pb2 import ConnectorModelTypeOptions, AccountConnectorAssetsModelFilters, \
    AccountConnectorAssets


class ArgoCDAssetManager(SourceAssetManager):

    def __init__(self):
        # print("Inside ArgoCDAssetManager")
        self.source = Source.ARGOCD
        self.asset_type_callable_map = {
            SourceModelType.ARGOCD_APPS: {
                'options': self.get_apps_options,
                'values': self.get_apps_values,
            }
        }

    @staticmethod
    def get_apps_options(apps_assets) -> ConnectorModelTypeOptions:
        all_apps = []
        for asset in apps_assets:
            all_apps.append(asset.metadata.get('name', asset.model_uid))
        apps_options = ArgoCDAppsAssetOptions(apps=all_apps)
        return ConnectorModelTypeOptions(model_type=SourceModelType.ARGOCD_APPS,
                                         argocd_apps_model_options=apps_options)

    @staticmethod
    def get_apps_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                        apps_assets):
        which_one_of = filters.WhichOneof('filters')
        if which_one_of and which_one_of != 'argocd_apps_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: ArgoCDAppsAssetOptions = filters.argocd_apps_model_filters
        filter_apps = options.apps
        if filter_apps:
            apps_assets = apps_assets.filter(metadata__name__in=filter_apps)

        argocd_asset_protos = []

        for asset in apps_assets:
            key = asset.model_uid
            metadata = asset.metadata
            name = metadata.get("name", "")
            path = metadata.get("path", "")

            argocd_asset_protos.append(ArgoCDAssetModel(
                id=UInt64Value(value=asset.id),
                connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                argocd_apps=ArgoCDAppsAssetModel(name=StringValue(value=name),
                                                 path=StringValue(value=path))))

        return AccountConnectorAssets(argocd=ArgoCDAssets(assets=argocd_asset_protos))
