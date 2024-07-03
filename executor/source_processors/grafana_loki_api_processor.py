import logging

import requests

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class GrafanaLokiApiProcessor(Processor):
    client = None

    def __init__(self, protocol, host, port, api_key, ssl_verify='true'):
        self.__protocol = protocol
        self.__host = host
        self.__port = port
        self.__api_key = api_key
        self.__ssl_verify = False if ssl_verify and ssl_verify.lower() == 'false' else True
        self.headers = {
            'Authorization': f'Bearer {self.__api_key}'
        }

    def test_connection(self):
        try:
            url = '{}/ready'.format(f"{self.__protocol}://{self.__host}:{self.__port}")
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return True
            else:
                status_code = response.status_code if response else None
                raise Exception(
                    f"Failed to connect with Grafana. Status Code: {status_code}. Response Text: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e

    def query(self, query, start, end, limit=1000):
        try:
            url = '{}/loki/api/v1/query_range'.format(f"{self.__protocol}://{self.__host}:{self.__port}")
            params = {
                'query': query,
                'start': start,
                'end': end,
                'limit': limit
            }
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify, params=params)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e
