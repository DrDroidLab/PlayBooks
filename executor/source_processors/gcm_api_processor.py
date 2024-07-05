import json
import logging


from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build


from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


def get_gcm_credentials(service_account_json_str):
    service_account_json = json.loads(service_account_json_str)
    scopes = ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/monitoring.read"]
    credentials = service_account.Credentials.from_service_account_info(service_account_json, scopes=scopes)

    # Refresh the credentials
    auth_req = Request()
    credentials.refresh(auth_req)

    return credentials


class GcmApiProcessor(Processor):
    def __init__(self, project_id, service_account_json):
        self.__service_account_json = service_account_json
        self.__project_id = project_id
        self.__credentials = get_gcm_credentials(self.__service_account_json)

    def test_connection(self):
        try:
            service = build('monitoring', 'v3', credentials=self.__credentials)
            request = service.projects().metricDescriptors().list(name=f"projects/{self.__project_id}")
            response = request.execute()
            return len(response.get('metricDescriptors', [])) > 0
        except Exception as e:
            logger.error(f"Exception occurred while testing connection: {e}")
            raise e

    def fetch_metrics(self, metric_type, start_time, end_time):
        try:
            service = build('monitoring', 'v3', credentials=self.__credentials)
            request = service.projects().timeSeries().list(
                name=f"projects/{self.__project_id}",
                filter=f'metric.type="{metric_type}"',
                interval_endTime=end_time,
                interval_startTime=start_time,
                view='FULL'
            )
            response = request.execute()
            return response.get('timeSeries', [])
        except Exception as e:
            logger.error(f"Exception occurred while fetching metrics: {e}")
            raise e

    def fetch_metrics_list(self):
        try:
            service = build('monitoring', 'v3', credentials=self.__credentials)
            request = service.projects().metricDescriptors().list(name=f"projects/{self.__project_id}")
            response = request.execute()
            return response.get('metricDescriptors', [])
        except Exception as e:
            logger.error(f"Exception occurred while fetching metric descriptors: {e}")
            raise e

    def fetch_logs(self, filter_str, start_time=None, end_time=None):
        try:
            service = build('logging', 'v2', credentials=self.__credentials)
            body = {
                "projectIds": [self.__project_id],
                "resourceNames": [f"projects/{self.__project_id}"],
                "filter": filter_str,
                "orderBy": "timestamp desc",
                "pageSize": 10
            }
            request = service.entries().list(body=body)
            response = request.execute()
            return response.get('entries', [])
        except Exception as e:
            logger.error(f"Exception occurred while fetching logs: {e}")
            raise e
