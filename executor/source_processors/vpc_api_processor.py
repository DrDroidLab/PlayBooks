import logging

import requests

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class VpcApiProcessor(Processor):
    client = None

    def __init__(self, agent_proxy_host, agent_proxy_api_key):
        self.__api_key = agent_proxy_api_key
        self.__host = agent_proxy_host
        self.headers = {
            'Authorization': f'Bearer {self.__api_key}'
        }

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
