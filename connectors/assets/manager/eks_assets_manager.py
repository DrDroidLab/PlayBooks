import logging
from datetime import timezone

from google.protobuf.wrappers_pb2 import UInt64Value, StringValue
from kubernetes.client import V1NamespaceList

from accounts.models import Account
from connectors.assets.manager.asset_manager import ConnectorAssetManager
from connectors.crud.connectors_crud import get_db_account_connectors, get_db_account_connector_keys
from executor.source_processors.aws_boto_3_api_processor import get_eks_api_instance
from protos.connectors.assets.eks_asset_pb2 import EksClusterAssetOptions, EksClusterAssetModel, EksAssetModel, \
    EksAssets, RegionCluster, Cluster, Command, Namespace
from protos.connectors.assets.asset_pb2 import AccountConnectorAssetsModelFilters, AccountConnectorAssets, \
    ConnectorModelTypeOptions
from protos.base_pb2 import Source, SourceKeyType, SourceModelType as SourceModelType

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

    def get_asset_model_options(self, model_type: SourceModelType, model_uid_metadata_list):
        if model_type == SourceModelType.EKS_CLUSTER:
            all_region_clusters: [RegionCluster] = []
            for item in model_uid_metadata_list:
                clusters: [Cluster] = [Cluster(name=StringValue(value=cluster)) for cluster in
                                       item['metadata']['clusters']]
                all_region_clusters.append(
                    RegionCluster(region=StringValue(value=item['model_uid']), clusters=clusters))
            options = EksClusterAssetOptions(regions=all_region_clusters)
            return ConnectorModelTypeOptions(model_type=model_type, eks_cluster_model_options=options)
        else:
            return None

    def get_asset_model_values(self, account: Account, model_type: SourceModelType,
                               filters: AccountConnectorAssetsModelFilters, eks_models):
        which_one_of = filters.WhichOneof('filters')

        region_cluster_filters = {}
        if model_type == SourceModelType.EKS_CLUSTER and (
                not which_one_of or which_one_of == 'eks_cluster_model_filters'):
            options: EksClusterAssetOptions = filters.eks_cluster_model_filters
            filter_regions: [RegionCluster] = options.regions
            eks_models = eks_models.filter(model_type=SourceModelType.EKS_CLUSTER)
            if filter_regions:
                regions = []
                for fr in filter_regions:
                    regions.append(fr.region.value)
                    if fr.clusters:
                        region_cluster_filters[fr.region.value] = [cluster.name.value for cluster in fr.clusters]
                eks_models = eks_models.filter(model_uid__in=regions)
        eks_asset_protos = []
        eks_connectors = get_db_account_connectors(account, connector_type=Source.EKS, is_active=True)
        if not eks_connectors:
            raise Exception("Active EKS connector not found for account: {}".format(account.id))
        eks_connector = eks_connectors.first()

        try:
            eks_connector_keys = get_db_account_connector_keys(account, connector_id=eks_connector.id)
        except Exception as e:
            raise Exception("Error while fetching EKS connector keys for account: {} - {}".format(account.id, str(e)))
        if not eks_connector_keys:
            raise Exception("Active EKS connector keys not found for account: {}".format(account.id))

        aws_session_token = None
        aws_access_key = None
        aws_secret_key = None
        eks_role_arn = None
        for key in eks_connector_keys:
            if key.key_type == SourceKeyType.AWS_ACCESS_KEY:
                aws_access_key = key.key
            elif key.key_type == SourceKeyType.AWS_SECRET_KEY:
                aws_secret_key = key.key
            elif key.key_type == SourceKeyType.EKS_ROLE_ARN:
                eks_role_arn = key.key
        if not aws_access_key or not aws_secret_key or not eks_role_arn:
            raise Exception(
                "EKS AWS access key, secret key, eks role arn not found for ""account: {}".format(account.id))

        for asset in eks_models:
            if asset.model_type == SourceModelType.EKS_CLUSTER:
                region_name = asset.model_uid
                filter_clusters = region_cluster_filters.get(region_name, asset.metadata['clusters']) if \
                    region_cluster_filters else asset.metadata['clusters']
                region_clusters = []
                for c in filter_clusters:
                    try:
                        eks_api_instance = get_eks_api_instance(aws_access_key, aws_secret_key, region_name,
                                                                eks_role_arn, c, aws_session_token)
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
