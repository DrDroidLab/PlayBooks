from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.gcm_api_processor import GcmApiProcessor
from protos.base_pb2 import Source, SourceModelType


class GcmSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, project_id, service_account_json, account_id=None, connector_id=None):
        self.__project_id = project_id
        self.__service_account_json = service_account_json
        super().__init__(account_id, connector_id, Source.GCM)

    def extract_metrics(self, save_to_db=False):
        model_data = {}
        gcm_api_processor = GcmApiProcessor(self.__project_id, self.__service_account_json)
        model_type = SourceModelType.GCM_METRIC
        metrics = gcm_api_processor.fetch_metrics_list()
        if not metrics:
            return model_data
        for metric in metrics:
            model_data[metric['type']] = {
                'description': metric.get('description', ''),
                'unit': metric.get('unit', '')
            }
        for metric_type in model_data:
            if save_to_db:
                self.create_or_update_model_metadata(model_type, metric_type, model_data[metric_type])
        return model_data

    def extract_logs(self, filter_str, start_time, end_time, save_to_db=False):
        model_data = {}
        gcm_api_processor = GcmApiProcessor(self.__project_id, self.__service_account_json)
        model_type = SourceModelType.GCM_LOGS
        logs = gcm_api_processor.fetch_logs(filter_str, start_time, end_time)
        if not logs:
            return model_data
        for log in logs:
            log_id = log['insertId']
            model_data[log_id] = {
                'timestamp': log.get('timestamp', ''),
                'severity': log.get('severity', ''),
                'textPayload': log.get('textPayload', ''),
                'jsonPayload': log.get('jsonPayload', {}),
                'protoPayload': log.get('protoPayload', {}),
                'resource': log.get('resource', {}),
                'logName': log.get('logName', ''),
                'receiveTimestamp': log.get('receiveTimestamp', ''),
                'labels': log.get('labels', {})
            }
        for log_id in model_data:
            if save_to_db:
                self.create_or_update_model_metadata(model_type, log_id, model_data[log_id])
        return model_data
