import base64
import logging
import tempfile
from datetime import datetime, timedelta

import boto3
import kubernetes
from awscli.customizations.eks.get_token import TokenGenerator, TOKEN_EXPIRATION_MINS, STSClientFactory

from executor.source_processors.processor import Processor
from utils.time_utils import current_milli_time

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


def get_eks_api_instance(aws_access_key, aws_secret_key, aws_region, k8_role_arn, cluster_name, aws_session_token=None,
                         client='api'):
    aws_client = AWSBoto3ApiProcessor('eks', aws_region, aws_access_key, aws_secret_key, aws_session_token)
    eks_details = aws_client.eks_describe_cluster(cluster_name)

    fp = tempfile.NamedTemporaryFile(delete=False)
    ca_filename = fp.name
    cert_bs = base64.urlsafe_b64decode(eks_details['certificateAuthority']['data'].encode('utf-8'))
    fp.write(cert_bs)
    fp.close()

    # Token for the EKS cluster
    token = get_eks_token(cluster_name, aws_access_key, aws_secret_key, aws_region, k8_role_arn, aws_session_token)
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


class AWSBoto3ApiProcessor(Processor):
    def __init__(self, client_type, region, aws_access_key, aws_secret_key, aws_session_token=None):
        self.client_type = client_type
        self.__aws_access_key = aws_access_key
        self.__aws_secret_key = aws_secret_key
        self.region = region
        self.__aws_session_token = aws_session_token

    def get_connection(self):
        try:
            client = boto3.client(self.client_type, aws_access_key_id=self.__aws_access_key,
                                  aws_secret_access_key=self.__aws_secret_key, region_name=self.region,
                                  aws_session_token=self.__aws_session_token)
            return client
        except Exception as e:
            logger.error(f"Exception occurred while creating boto3 client with error: {e}")
            raise e

    def test_connection(self):
        try:
            if self.client_type == 'eks':
                clusters = self.eks_list_clusters()
                print("Connection to Amazon EKS successful.")
                return True
            elif self.client_type == 'cloudwatch':
                client = self.get_connection()
                response = client.list_metrics()
                print("Connection to Amazon CloudWatch successful.")
                return True
            elif self.client_type == 'logs':
                log_groups = self.logs_describe_log_groups()
                print("Connection to Amazon CloudWatch Logs successful.")
                return True
        except Exception as e:
            logger.error(f"Exception occurred while testing cloudwatch connection with error: {e}")
            raise e

    def cloudwatch_describe_alarms(self, alarm_names):
        try:
            client = self.get_connection()
            response = client.describe_alarms(AlarmNames=alarm_names)
            if response['ResponseMetadata']['HTTPStatusCode'] == 200 and response['MetricAlarms']:
                return response['MetricAlarms']
            else:
                print(f"No alarms found for '{alarm_names}'")
        except Exception as e:
            logger.error(
                f"Exception occurred while fetching cloudwatch alarms for alarm_names: {alarm_names} with error: {e}")
            raise e

    def cloudwatch_list_metrics(self):
        try:
            all_metrics = []
            client = self.get_connection()
            paginator = client.get_paginator('list_metrics')
            for response in paginator.paginate():
                metrics = response['Metrics']
                all_metrics.extend(metrics)
            return all_metrics
        except Exception as e:
            logger.error(f"Exception occurred while fetching cloudwatch metrics with error: {e}")
            raise e

    def cloudwatch_get_metric_statistics(self, namespace, metric, start_time, end_time, period, statistics, dimensions):
        try:
            client = self.get_connection()
            response = client.get_metric_statistics(
                Namespace=namespace,
                MetricName=metric,
                StartTime=start_time,
                EndTime=end_time,
                Period=period,
                Statistics=statistics,
                Dimensions=dimensions
            )
            return response
        except Exception as e:
            logger.error(
                f"Exception occurred while fetching cloudwatch metric statistics for metric: {metric} with error: {e}")
            raise e

    def logs_describe_log_groups(self):
        try:
            client = self.get_connection()
            paginator = client.get_paginator('describe_log_groups')
            log_groups = []
            for page in paginator.paginate():
                for log_group in page['logGroups']:
                    log_groups.append(log_group['logGroupName'])
            return log_groups
        except Exception as e:
            logger.error(f"Exception occurred while fetching log groups with error: {e}")
            raise e

    def logs_filter_events(self, log_group, query_pattern, start_time, end_time):
        try:
            client = self.get_connection()
            start_query_response = client.start_query(
                logGroupName=log_group,
                startTime=start_time,
                endTime=end_time,
                queryString=query_pattern,
            )

            query_id = start_query_response['queryId']

            status = 'Running'
            query_start_time = current_milli_time()
            while status == 'Running' or status == 'Scheduled':
                print("Waiting for query to complete...")
                response = client.get_query_results(queryId=query_id)
                status = response['status']
                if status == 'Complete':
                    return response['results']
                elif current_milli_time() - query_start_time > 60000:
                    print("Query took too long to complete. Aborting...")
                    stop_query_response = client.stop_query(queryId=query_id)
                    print(f"Query stopped with response: {stop_query_response}")
                    return None
            return None
        except Exception as e:
            logger.error(f"Exception occurred while fetching logs for log_group: {log_group} with error: {e}")
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
