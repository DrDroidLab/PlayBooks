import base64
import logging
import tempfile
from datetime import datetime, timedelta

import boto3
import kubernetes
from awscli.customizations.eks.get_token import TokenGenerator, TOKEN_EXPIRATION_MINS, STSClientFactory

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


def get_expiration_time():
    token_expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION_MINS)
    return token_expiration.strftime('%Y-%m-%dT%H:%M:%SZ')


def get_eks_token(cluster_name: str, aws_access_key: str, aws_secret_key: str, region: str,
                  role_arn: str = None, aws_session_token=None) -> dict:
    aws_session = boto3.Session(
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=region,
        aws_session_token=aws_session_token
    )
    client_factory = STSClientFactory(aws_session._session)
    sts_client = client_factory.get_sts_client(role_arn=role_arn)
    token = TokenGenerator(sts_client).get_token(cluster_name)
    return token


class EKSApiProcessor(Processor):
    def __init__(self, region, aws_access_key, aws_secret_key, k8_role_arn, aws_session_token=None):
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.region = region
        self.__k8_role_arn = k8_role_arn
        self.__aws_session_token = aws_session_token

    def get_connection(self):
        try:
            client = boto3.client('eks', aws_access_key_id=self.__aws_access_key,
                                  aws_secret_access_key=self.__aws_secret_key, region_name=self.region,
                                  aws_session_token=self.__aws_session_token)
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating boto3 client with error: {e}")
            raise e

    def test_connection(self):
        try:
            client = self.get_connection()
            clusters = client.list_clusters()['clusters']
            if clusters:
                return True
            else:
                raise Exception("No clusters found in the eks connection")
        except Exception as e:
            logger.error(f"Exception occurred while testing cloudwatch connection with error: {e}")
            raise e

    def eks_list_clusters(self):
        try:
            client = self.get_connection()
            clusters = client.list_clusters()['clusters']
            return clusters
        except Exception as e:
            logger.error(f"Exception occurred while fetching EKS clusters with error: {e}")
            raise e

    def eks_describe_cluster(self, cluster_name):
        try:
            client = self.get_connection()
            cluster_details = client.describe_cluster(name=cluster_name)['cluster']
            return cluster_details
        except Exception as e:
            logger.error(f"Exception occurred while fetching EKS clusters with error: {e}")
            raise e

    def eks_get_api_instance(self, cluster_name, client='api'):
        eks_details = self.eks_describe_cluster(cluster_name)

        fp = tempfile.NamedTemporaryFile(delete=False)
        ca_filename = fp.name
        cert_bs = base64.urlsafe_b64decode(eks_details['certificateAuthority']['data'].encode('utf-8'))
        fp.write(cert_bs)
        fp.close()

        # Token for the EKS cluster
        token = get_eks_token(cluster_name, self.__aws_access_key, self.__aws_secret_key, self.region,
                              self.__k8_role_arn, self.__aws_session_token)
        if not token:
            logger.error(f"Error occurred while fetching token for EKS cluster: {cluster_name}")
            return None

        # Kubernetes client config
        conf = kubernetes.client.Configuration()
        conf.host = eks_details['endpoint']
        conf.api_key['authorization'] = token
        conf.api_key_prefix['authorization'] = 'Bearer'
        conf.ssl_ca_cert = ca_filename
        with kubernetes.client.ApiClient(conf) as api_client:
            if client == 'api':
                api_instance = kubernetes.client.CoreV1Api(api_client)
                return api_instance
            elif client == 'app':
                app_instance = kubernetes.client.AppsV1Api(api_client)
                return app_instance
