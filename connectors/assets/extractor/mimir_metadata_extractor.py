import re
import time

from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.grafana_api_processor import GrafanaApiProcessor
from integrations_api_processors.mimir_api_processor import MimirApiProcessor
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto, ConnectorType

class MimirConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, mimir_host, account_id=None, connector_id=None):
        self.__mimir_api_processor = MimirApiProcessor(mimir_host)

        super().__init__(account_id, connector_id, ConnectorType.GRAFANA_MIMIR)

    def extract_data_source(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.GRAFANA_TARGET_METRIC_PROMQL
        # try:
        #     datasources = self.__grafana_api_processor.fetch_data_sources()
        # except Exception as e:
        #     print(f"Exception occurred while fetching grafana data sources with error: {e}")
        #     return
        # if not datasources:
        #     return
        model_data = {}
        # for ds in datasources:
        #     datasource_id = ds['uid']
        #     model_data[datasource_id] = ds
        #     if save_to_db:
        #         self.create_or_update_model_metadata(model_type, datasource_id, ds)
        return model_data
