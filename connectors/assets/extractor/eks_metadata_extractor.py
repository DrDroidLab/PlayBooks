import logging

from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from executor.source_processors.eks_api_processor import EKSApiProcessor
from protos.base_pb2 import Source, SourceModelType
from utils.logging_utils import log_function_call

logger = logging.getLogger(__name__)


class EksSourceMetadataExtractor(SourceMetadataExtractor):

    def __init__(self, aws_access_key, aws_secret_key, region, k8_role_arn, account_id=None, connector_id=None):
        self.__region = region
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.__aws_session_token = None
        self.__k8_role_arn = k8_role_arn
        super().__init__(account_id, connector_id, Source.EKS)

    @log_function_call
    def extract_clusters(self, save_to_db=False):
        model_data = {}
        aws_boto3_processor = EKSApiProcessor(self.__region, self.__aws_access_key, self.__aws_secret_key,
                                              self.__aws_session_token)
        model_type = SourceModelType.EKS_CLUSTER
        clusters = aws_boto3_processor.eks_list_clusters()
        if not clusters:
            return model_data
        model_data[self.__region] = {'clusters': clusters}
        if save_to_db:
            self.create_or_update_model_metadata(model_type, self.__region, {'clusters': clusters})
        return model_data
