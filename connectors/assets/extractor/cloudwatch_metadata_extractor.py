import logging

from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import Source, SourceModelType
from utils.logging_utils import log_function_call

logger = logging.getLogger(__name__)


class CloudwatchSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, region, aws_access_key=None, aws_secret_key=None, account_id=None, connector_id=None):
        self.__region = region
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.__aws_session_token = None

        super().__init__(account_id, connector_id, Source.CLOUDWATCH)

    @log_function_call
    def extract_metric(self, save_to_db=False):
        model_type = SourceModelType.CLOUDWATCH_METRIC
        model_data = {}
        try:
            cloudwatch_boto3_processor = AWSBoto3ApiProcessor('cloudwatch', self.__region, self.__aws_access_key,
                                                              self.__aws_secret_key, self.__aws_session_token)
            all_metrics = cloudwatch_boto3_processor.cloudwatch_list_metrics()
            for metric in all_metrics:
                namespace = f"{metric['Namespace']}"
                namespace_map = model_data.get(namespace, {})
                region_map = namespace_map.get(self.__region, {})
                metric_map = region_map.get(metric['MetricName'], {})
                dimension_map = metric_map.get('Dimensions', {})
                for dimension in metric['Dimensions']:
                    dimension_values = dimension_map.get(dimension['Name'], [])
                    dimension_values.append(dimension['Value'])
                    dimension_map[dimension['Name']] = list(set(dimension_values))
                region_map[metric['MetricName']] = {'Dimensions': dimension_map,
                                                    'DimensionNames': list(dimension_map.keys())}
                namespace_map[self.__region] = region_map
                model_data[namespace] = namespace_map
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, namespace, model_data[namespace])
        except Exception as e:
            logger.error(f'Error extracting metrics: {e}')
        return model_data

    @log_function_call
    def extract_log_groups(self, save_to_db=False):
        model_type = SourceModelType.CLOUDWATCH_LOG_GROUP
        model_data = {}
        cloudwatch_boto3_processor = AWSBoto3ApiProcessor('logs', self.__region, self.__aws_access_key,
                                                          self.__aws_secret_key, self.__aws_session_token)
        try:
            all_log_groups = cloudwatch_boto3_processor.logs_describe_log_groups()
            model_data[self.__region] = {'log_groups': all_log_groups}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, self.__region, model_data[self.__region])
        except Exception as e:
            logger.error(f'Error extracting log groups: {e}')
        return model_data
