from connectors.assets.extractor.clickhouse_metadata_extractor import ClickhouseConnectorMetadataExtractor
from connectors.assets.extractor.cloudwatch_metadata_extractor import CloudwatchConnectorMetadataExtractor
from connectors.assets.extractor.datadog_metadata_extractor import DatadogConnectorMetadataExtractor
from connectors.assets.extractor.eks_metadata_extractor import EksConnectorMetadataExtractor
from connectors.assets.extractor.grafana_metadata_extractor import GrafanaConnectorMetadataExtractor
from connectors.assets.extractor.grafana_vpc_metadata_extractor import GrafanaVpcConnectorMetadataExtractor
from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from connectors.assets.extractor.newrelic_metadata_extractor import NewrelicConnectorMetadataExtractor
from connectors.assets.extractor.postgres_metadata_extractor import PostgresConnectorMetadataExtractor
from connectors.assets.extractor.remote_server_metadata_extractor import RemoteServerConnectorMetadataExtractor
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto


class ConnectorMetadataExtractorFacade:

    def __init__(self):
        self._map = {}

    def register(self, connector_type: ConnectorTypeProto, metadata_extractor: ConnectorMetadataExtractor.__class__):
        self._map[connector_type] = metadata_extractor

    def get_connector_metadata_extractor_class(self, connector_type: ConnectorTypeProto):
        if connector_type not in self._map:
            raise ValueError(f'No metadata extractor found for connector type: {connector_type}')
        return self._map[connector_type]


connector_metadata_extractor_facade = ConnectorMetadataExtractorFacade()
connector_metadata_extractor_facade.register(ConnectorTypeProto.NEW_RELIC, NewrelicConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.DATADOG, DatadogConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.DATADOG_OAUTH, DatadogConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.CLOUDWATCH, CloudwatchConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.GRAFANA, GrafanaConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.GRAFANA_VPC, GrafanaVpcConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.CLICKHOUSE, ClickhouseConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.POSTGRES, PostgresConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.EKS, EksConnectorMetadataExtractor)
connector_metadata_extractor_facade.register(ConnectorTypeProto.REMOTE_SERVER, RemoteServerConnectorMetadataExtractor)
