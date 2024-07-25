import logging

import requests

from executor.source_processors.processor import Processor
from protos.base_pb2 import Source

logger = logging.getLogger(__name__)


class VpcApiProcessor(Processor):
    client = None

    def __init__(self, agent_proxy_host, agent_proxy_api_key, parent_source=None):
        self.__api_key = agent_proxy_api_key
        self.__host = agent_proxy_host
        self.__parent_source = parent_source
        self.headers = {
            'Authorization': f'Bearer {self.__api_key}'
        }

    def test_connection(self):
        try:
            if self.__parent_source == Source.GRAFANA_VPC:
                url = "{}/proxy/v1/api/grafana".format(self.__host)
                data = {
                    "method": "GET",
                    "path": 'api/datasources'
                }
            else:
                raise Exception(f"Parent source {Source.Name(self.__parent_source)} not supported")
            response = requests.post(url, headers=self.headers, data=data)
            if response and response.status_code == 200:
                return True
            else:
                status_code = response.status_code if response else None
                raise Exception(
                    f"Failed to connect with {Source.Name(self.__parent_source)}. Status Code: {status_code}. Response Text: {response.text}")
        except Exception as e:
            logger.error(
                f"Exception occurred while fetching {Source.Name(self.__parent_source)} data source with error: {e}")
            raise e

    def v1_api_grafana(self, path):
        try:
            request_url = "{}/proxy/v1/api/grafana".format(self.__host)
            response = requests.post(request_url, headers=self.headers, data={
                "method": "GET",
                "path": path
            })
            if response and response.status_code == 200:
                return response.json()
            else:
                status_code = response.status_code if response else None
                raise Exception(
                    f"Failed to connect with Grafana. Status Code: {status_code}. Response Text: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e
