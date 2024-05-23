import logging
import requests

logger = logging.getLogger(__name__)


class MimirApiProcessor:
    client = None

    def __init__(self, mimir_host, x_scope_org_id='anonymous', ssl_verify=True):
        self.__host = mimir_host
        self.__ssl_verify = True
        if ssl_verify and ssl_verify.lower() == 'false':
            self.__ssl_verify = False
        self.headers = {'X-Scope-OrgID': x_scope_org_id}

    def test_connection(self):
        try:
            url = '{}/config'.format(self.__host)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return True
            else:
                status_code = response.status_code if response else None
                raise Exception(
                    f"Failed to connect with Mimir. Status Code: {status_code}. Response Text: {response.text}")
        except Exception as e:
            logger.error(f"Exception occurred while querying mimir config with error: {e}")
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

    def fetch_promql_metric_timeseries(self, query, start, end, step):
        try:
            url = '{}/prometheus/api/v1/query_range?query={}&start={}&end={}&step={}'.format(
                self.__host, query, start, end, step)
            response = requests.get(url, headers=self.headers, verify=self.__ssl_verify)
            if response and response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while getting promql metric timeseries with error: {e}")
            raise e
