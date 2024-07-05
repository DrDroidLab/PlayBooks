from connectors.assets.extractor.azure_metadata_extractor import AzureConnectorMetadataExtractor
from connectors.assets.extractor.clickhouse_metadata_extractor import ClickhouseSourceMetadataExtractor
from connectors.assets.extractor.cloudwatch_metadata_extractor import CloudwatchSourceMetadataExtractor
from connectors.assets.extractor.datadog_metadata_extractor import DatadogSourceMetadataExtractor
from connectors.assets.extractor.eks_metadata_extractor import EksSourceMetadataExtractor
from connectors.assets.extractor.elastic_search_metadata_extractor import ElasticSearchSourceMetadataExtractor
from connectors.assets.extractor.gcm_metadata_extractor import GcmSourceMetadataExtractor
from connectors.assets.extractor.gke_metadata_extractor import GkeSourceMetadataExtractor
from connectors.assets.extractor.grafana_metadata_extractor import GrafanaSourceMetadataExtractor
from connectors.assets.extractor.grafana_vpc_metadata_extractor import GrafanaVpcSourceMetadataExtractor
from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from connectors.assets.extractor.mimir_metadata_extractor import MimirSourceMetadataExtractor
from connectors.assets.extractor.newrelic_metadata_extractor import NewrelicSourceMetadataExtractor
from protos.base_pb2 import Source


class SourceMetadataExtractorFacade:

    def __init__(self):
        self._map = {}

    def register(self, source: Source, metadata_extractor: SourceMetadataExtractor.__class__):
        self._map[source] = metadata_extractor

    def get_connector_metadata_extractor_class(self, connector_type: Source):
        if connector_type not in self._map:
            raise ValueError(f'No metadata extractor found for connector type: {connector_type}')
        return self._map[connector_type]


source_metadata_extractor_facade = SourceMetadataExtractorFacade()
source_metadata_extractor_facade.register(Source.NEW_RELIC, NewrelicSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.DATADOG, DatadogSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.DATADOG_OAUTH, DatadogSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.CLOUDWATCH, CloudwatchSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.GRAFANA, GrafanaSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.GRAFANA_VPC, GrafanaVpcSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.CLICKHOUSE, ClickhouseSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.EKS, EksSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.GRAFANA_MIMIR, MimirSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.AZURE, AzureConnectorMetadataExtractor)
source_metadata_extractor_facade.register(Source.GKE, GkeSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.ELASTIC_SEARCH, ElasticSearchSourceMetadataExtractor)
source_metadata_extractor_facade.register(Source.GCM, GcmSourceMetadataExtractor)
