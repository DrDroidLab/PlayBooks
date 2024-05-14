from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from integrations_api_processors.aws_boto_3_api_processor import AWSBoto3ApiProcessor
from protos.base_pb2 import Source as ConnectorType
from protos.connectors.connector_pb2 import ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


class EksConnectorMetadataExtractor(ConnectorMetadataExtractor):

    def __init__(self, aws_access_key, aws_secret_key, regions, account_id=None, connector_id=None):
        self.__regions = regions
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.__aws_session_token = None
        super().__init__(account_id, connector_id, ConnectorType.EKS)

    def extract_clusters(self, save_to_db=False):
        model_data = {}
        for region in self.__regions:
            aws_boto3_processor = AWSBoto3ApiProcessor('eks', region, self.__aws_access_key, self.__aws_secret_key,
                                                       self.__aws_session_token)
            model_type = ConnectorMetadataModelTypeProto.EKS_CLUSTER
            clusters = aws_boto3_processor.eks_list_clusters()
            if not clusters:
                continue
            model_data[region] = {'clusters': clusters}
            if save_to_db:
                self.create_or_update_model_metadata(model_type, region, {'clusters': clusters})
        return model_data
