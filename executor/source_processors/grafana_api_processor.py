import logging

import requests

from executor.source_processors.processor import Processor

logger = logging.getLogger(__name__)


class GrafanaApiProcessor(Processor):
    client = None

    def __init__(self, grafana_host, grafana_api_key, ssl_verify='true'):
        self.__host = grafana_host
        self.__api_key = grafana_api_key
        self.__ssl_verify = False if ssl_verify == 'false' else True
        self.headers = {
            'Authorization': f'Bearer {self.__api_key}'
        }

    def test_connection(self):
        try:
            url = '{}/api/datasources'.format(self.__host)
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

    def fetch_data_sources(self):
        try:
            url = '{}/api/datasources'.format(self.__host)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana data sources with error: {e}")
            raise e

    def fetch_dashboards(self):
        try:
            url = '{}/api/search'.format(self.__host)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana dashboards with error: {e}")
            raise e

    def fetch_dashboard_details(self, uid):
        try:
            url = '{}/api/dashboards/uid/{}'.format(self.__host, uid)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching grafana dashboard details with error: {e}")
            raise e

    # Promql Datasource APIs
    def fetch_promql_metric_labels(self, promql_datasource_uid, metric_name):
        try:
            url = '{}/api/datasources/proxy/uid/{}/api/v1/labels?match[]={}'.format(self.__host, promql_datasource_uid,
                                                                                    metric_name)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching promql metric labels with error: {e}")
            raise e

    def fetch_promql_metric_label_values(self, promql_datasource_uid, metric_name, label_name):
        try:
            url = '{}/api/datasources/proxy/uid/{}/api/v1/label/{}/values?match[]={}'.format(self.__host,
                                                                                             promql_datasource_uid,
                                                                                             label_name, metric_name)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching promql metric labels with error: {e}")
            raise e

    def fetch_promql_metric_timeseries(self, promql_datasource_uid, query, start, end, step):
        try:
            url = '{}/api/datasources/proxy/uid/{}/api/v1/query_range?query={}&start={}&end={}&step={}'.format(
                self.__host, promql_datasource_uid, query, start, end, step)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while getting promql metric timeseries with error: {e}")
            raise e
