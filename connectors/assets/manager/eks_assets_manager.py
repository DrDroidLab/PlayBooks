import logging
from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue
from kubernetes.client import V1NamespaceList

from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.utils import generate_credentials_dict
from executor.source_processors.eks_api_processor import EKSApiProcessor
from protos.connectors.assets.eks_asset_pb2 import EksClusterAssetOptions, EksClusterAssetModel, EksAssetModel, \
    EksAssets, RegionCluster, Cluster, Command, Namespace
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source, SourceModelType as SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto

logger = logging.getLogger(__name__)

allowed_commands = [
    Command(type=StringValue(value='GET_PODS'), description=StringValue(value='Get Pod Details')),
    Command(type=StringValue(value='GET_DEPLOYMENTS'), description=StringValue(value='Get Deployment Details')),
    Command(type=StringValue(value='GET_EVENTS'), description=StringValue(value='Get Events Details')),
    Command(type=StringValue(value='GET_SERVICES'), description=StringValue(value='Get Services Details')),
]


class EKSAssetManager(ConnectorAssetManager):

    def __init__(self):
        self.source = Source.EKS
        self.asset_type_callable_map = {
            SourceModelType.EKS_CLUSTER: {
                'options': self.get_eks_cluster_options,
                'values': self.get_eks_cluster_values,
            }
        }

    @staticmethod
    def get_eks_cluster_options(eks_cluster_assets):
        all_region_clusters: [RegionCluster] = []
        for asset in eks_cluster_assets:
            clusters: [Cluster] = [Cluster(name=StringValue(value=cluster)) for cluster in
                                   asset.metadata.get('clusters', [])]
            all_region_clusters.append(
                RegionCluster(region=StringValue(value=asset.model_uid), clusters=clusters))
        options = EksClusterAssetOptions(regions=all_region_clusters)
        return ConnectorModelTypeOptions(model_type=SourceModelType.EKS_CLUSTER, eks_cluster_model_options=options)

    @staticmethod
    def get_eks_cluster_values(connector: ConnectorProto, filters: AccountConnectorAssetsModelFilters,
                               eks_cluster_assets):
        which_one_of = filters.WhichOneof('filters')
        region_cluster_filters = {}
        if which_one_of and which_one_of != 'eks_cluster_model_filters':
            raise ValueError(f"Invalid filter: {which_one_of}")

        options: EksClusterAssetOptions = filters.eks_cluster_model_filters
        filter_regions: [RegionCluster] = options.regions
        if filter_regions:
            regions = []
            for fr in filter_regions:
                regions.append(fr.region.value)
                if fr.clusters:
                    region_cluster_filters[fr.region.value] = [cluster.name.value for cluster in fr.clusters]
            eks_cluster_assets = eks_cluster_assets.filter(model_uid__in=regions)
        eks_asset_protos = []
        connector_credentials = generate_credentials_dict(connector.type, connector.keys)
        for asset in eks_cluster_assets:
            region_name = asset.model_uid
            filter_clusters = region_cluster_filters.get(region_name, asset.metadata.get('clusters', [])) if \
                region_cluster_filters else asset.metadata.get('clusters', [])
            region_clusters = []
            connector_credentials['region'] = region_name
            for c in filter_clusters:
                try:
                    eks_processor = EKSApiProcessor(**connector_credentials)
                    eks_api_instance = eks_processor.eks_get_api_instance(c)
                    api_response: V1NamespaceList = eks_api_instance.list_namespace(pretty='pretty')
                except Exception as e:
                    logger.error("Error while fetching namespaces for cluster: {} in region: {} - {}".format(c,
                                                                                                             region_name,
                                                                                                             str(e)))
                    continue
                api_response_dict = api_response.to_dict()
                items = api_response_dict.get('items')
                namespaces: [Namespace] = [Namespace(name=StringValue(value=item.get('metadata').get('name'))) for
                                           item
                                           in items]
                region_clusters.append(Cluster(name=StringValue(value=c), namespaces=namespaces))
            eks_asset_protos.append(EksAssetModel(
                id=UInt64Value(value=asset.id), connector_type=asset.connector_type,
                type=asset.model_type,
                last_updated=int(asset.updated_at.replace(tzinfo=timezone.utc).timestamp()) if (
                    asset.updated_at) else None,
                eks_cluster=EksClusterAssetModel(region=StringValue(value=region_name), clusters=region_clusters,
                                                 commands=allowed_commands)))
        return AccountConnectorAssets(eks=EksAssets(assets=eks_asset_protos))
