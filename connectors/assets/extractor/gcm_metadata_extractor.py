import json
import logging
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.gcm_api_processor import GcmApiProcessor
from protos.base_pb2 import Source, SourceModelType

logger = logging.getLogger(__name__)


class GcmSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, project_id, service_account_json, account_id=None, connector_id=None):
        self.__project_id = project_id
        self.__service_account_json = service_account_json
        self.__credentials = self.__get_gcm_credentials(service_account_json)
        super().__init__(account_id, connector_id, Source.GCM)

    def extract_metric_descriptors(self, save_to_db=False):
        model_type = SourceModelType.GCM_METRIC
        model_data = {}
        gcm_api_processor = GcmApiProcessor(self.__project_id, self.__service_account_json)

        try:
            all_metric_descriptors = gcm_api_processor.fetch_metrics_list()
            for descriptor in all_metric_descriptors:
                metric_type = descriptor['type']
                description = descriptor.get('description', '')
                labels = descriptor.get('labels', [])

                model_data[metric_type] = {
                    'description': description,
                    'labels': labels
                }

                if save_to_db:
                    self.create_or_update_model_metadata(model_type, metric_type, model_data[metric_type])
        except Exception as e:
            logger.error(f'Error extracting metric descriptors: {e}')

        return model_data

    def extract_log_sinks(self, save_to_db=False):
        model_type = SourceModelType.GCM_LOG_SINK
        model_data = {}
        gcm_api_processor = GcmApiProcessor(self.__project_id, self.__service_account_json)

        try:
            all_log_sinks = gcm_api_processor.fetch_log_sinks()
            model_data[self.__project_id] = {'log_sinks': all_log_sinks}

            if save_to_db:
                self.create_or_update_model_metadata(model_type, self.__project_id, model_data[self.__project_id])
        except Exception as e:
            logger.error(f'Error extracting log sinks: {e}')

        return model_data
