import logging
from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue
from kubernetes.client import V1NamespaceList

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.utils import generate_credentials_dict
from executor.source_processors.gke_api_processor import GkeApiProcessor
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source, SourceModelType as SourceModelType
from protos.connectors.assets.gke_asset_pb2 import ZoneCluster, GkeCluster, GkeClusterAssetOptions, GkeNamespace, \
    GkeAssetModel, GkeClusterAssetModel, GkeAssets
from protos.connectors.connector_pb2 import Connector as ConnectorProto

logger = logging.getLogger(__name__)


class GkeAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.GKE
        self.asset_type_callable_map = {
            SourceModelType.GKE_CLUSTER: {
                'options': self.get_gke_cluster_options,
                'values': self.get_gke_cluster_values,
            }
        }

    @staticmethod
    def get_gke_cluster_options(gke_cluster_assets):
        all_zone_clusters: [ZoneCluster] = []
        for asset in gke_cluster_assets:
            clusters: [GkeCluster] = [GkeCluster(name=StringValue(value=cluster)) for cluster in
                                      asset.metadata.get('clusters', [])]
            all_zone_clusters.append(
                ZoneCluster(zone=StringValue(value=asset.model_uid), clusters=clusters))
        options = GkeClusterAssetOptions(zones=all_zone_clusters)
        return ConnectorModelTypeOptions(model_type=SourceModelType.GKE_CLUSTER, eks_cluster_model_options=options)

    @staticmethod
    def get_gke_cluster_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                               gke_cluster_assets):
        which_one_of = filters.WhichOneof('filters')
        zone_cluster_filters = {}
        if which_one_of and which_one_of != 'eks_cluster_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: GkeClusterAssetOptions = filters.gke_cluster_model_filters
        filter_zones: [ZoneCluster] = options.zones
        if filter_zones:
            zones = []
            for fr in filter_zones:
                zones.append(fr.zone.value)
                if fr.clusters:
                    zone_cluster_filters[fr.zone.value] = [cluster.name.value for cluster in fr.clusters]
            gke_cluster_assets = gke_cluster_assets.filter(model_uid__in=zones)
        gke_asset_protos = []

        for asset in gke_cluster_assets:
            zone_name = asset.model_uid
            filter_clusters = zone_cluster_filters.get(zone_name, asset.metadata.get('clusters', [])) if \
                zone_cluster_filters else asset.metadata.get('clusters', [])
            zone_clusters = []
            for c in filter_clusters:
                try:
                    credentials = generate_credentials_dict(connector.type, connector.keys)
                    gke_api_processor = GkeApiProcessor(**credentials)
                    api_response: V1NamespaceList = gke_api_processor.list_namespaces(zone_name, c)
                except Exception as e:
                    logger.error("Error while fetching namespaces for cluster: {} in region: {} - {}".format(c,
                                                                                                             zone_name,
                                                                                                             str(e)))
                    continue
                api_response_dict = api_response.to_dict()
                items = api_response_dict.get('items')
                namespaces: [GkeNamespace] = [GkeNamespace(name=StringValue(value=item.get('metadata').get('name'))) for
                                              item in items]
                zone_clusters.append(GkeCluster(name=StringValue(value=c), namespaces=namespaces))
            gke_asset_protos.append(GkeAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                gke_cluster=GkeClusterAssetModel(zone=StringValue(value=zone_name), clusters=zone_clusters)))
        return AccountConnectorAssets(gke=GkeAssets(assets=gke_asset_protos))
