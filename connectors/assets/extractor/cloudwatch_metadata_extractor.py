from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class CloudwatchConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, regions, aws_access_key=None, aws_secret_key=None, account_id=None, connector_id=None):
        self.__regions = regions
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.__aws_session_token = None

        super().__init__(account_id, connector_id, ConnectorType.CLOUDWATCH)

    def extract_metric(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.CLOUDWATCH_METRIC
        model_data = {}
        for region in self.__regions:
            cloudwatch_boto3_processor = AWSBoto3ApiProcessor('cloudwatch', region, self.__aws_access_key,
                                                              self.__aws_secret_key, self.__aws_session_token)
            try:
                try:
                    all_metrics = cloudwatch_boto3_processor.cloudwatch_list_metrics()
                except Exception as e:
                    print(f'Error fetching all metrics: {e}')
                    continue
                for metric in all_metrics:
                    namespace = f"{metric['Namespace']}"
                    namespace_map = model_data.get(namespace, {})
                    region_map = namespace_map.get(region, {})
                    metric_map = region_map.get(metric['MetricName'], {})
                    dimension_map = metric_map.get('Dimensions', {})
                    for dimension in metric['Dimensions']:
                        dimension_values = dimension_map.get(dimension['Name'], [])
                        dimension_values.append(dimension['Value'])
                        dimension_map[dimension['Name']] = list(set(dimension_values))
                    region_map[metric['MetricName']] = {'Dimensions': dimension_map,
                                                        'DimensionNames': list(dimension_map.keys())}
                    namespace_map[region] = region_map
                    model_data[namespace] = namespace_map
                    if save_to_db:
                        self.create_or_update_model_metadata(model_type, namespace, model_data[namespace])
            except Exception as e:
                print(f'Error extracting metrics: {e}')
                continue
        return model_data

    def extract_log_groups(self, save_to_db=False):
        model_type = ConnectorMetadataModelTypeProto.CLOUDWATCH_LOG_GROUP
        model_data = {}
        for region in self.__regions:
            cloudwatch_boto3_processor = AWSBoto3ApiProcessor('logs', region, self.__aws_access_key,
                                                              self.__aws_secret_key, self.__aws_session_token)
            try:
                all_log_groups = cloudwatch_boto3_processor.logs_describe_log_groups()
                model_data[region] = {'log_groups': all_log_groups}
                if save_to_db:
                    self.create_or_update_model_metadata(model_type, region, model_data[region])
            except Exception as e:
                print(f'Error extracting log groups: {e}')
                continue
        return model_data
