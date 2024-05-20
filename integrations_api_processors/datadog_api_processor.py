import json
import logging

import requests
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.exceptions import ApiException
from datadog_api_client.v1.api.authentication_api import AuthenticationApi
from datadog_api_client.v1.api.aws_integration_api import AWSIntegrationApi
from datadog_api_client.v1.api.aws_logs_integration_api import AWSLogsIntegrationApi
from datadog_api_client.v1.api.azure_integration_api import AzureIntegrationApi
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.model.authentication_validation_response import AuthenticationValidationResponse
from datadog_api_client.v1.model.azure_account_list_response import AzureAccountListResponse
from datadog_api_client.v2.api.cloudflare_integration_api import CloudflareIntegrationApi
from datadog_api_client.v2.api.confluent_cloud_api import ConfluentCloudApi
from datadog_api_client.v2.api.fastly_integration_api import FastlyIntegrationApi
from datadog_api_client.v2.api.gcp_integration_api import GCPIntegrationApi
from datadog_api_client.v2.api.metrics_api import MetricsApi
from datadog_api_client.v2.model.formula_limit import FormulaLimit
from datadog_api_client.v2.model.metrics_data_source import MetricsDataSource
from datadog_api_client.v2.model.metrics_timeseries_query import MetricsTimeseriesQuery
from datadog_api_client.v2.model.query_formula import QueryFormula
from datadog_api_client.v2.model.query_sort_order import QuerySortOrder
from datadog_api_client.v2.model.timeseries_formula_query_request import TimeseriesFormulaQueryRequest
from datadog_api_client.v2.model.timeseries_formula_query_response import TimeseriesFormulaQueryResponse
from datadog_api_client.v2.model.timeseries_formula_request import TimeseriesFormulaRequest
from datadog_api_client.v2.model.timeseries_formula_request_attributes import TimeseriesFormulaRequestAttributes
from datadog_api_client.v2.model.timeseries_formula_request_queries import TimeseriesFormulaRequestQueries
from datadog_api_client.v2.model.timeseries_formula_request_type import TimeseriesFormulaRequestType

from protos.base_pb2 import TimeRange
from protos.base_pb2 import Source

logger = logging.getLogger(__name__)


class DatadogApiProcessor(object):
    def __init__(self, dd_app_key, dd_api_key, dd_api_domain=None, dd_connector_type=None):
        self.__dd_app_key = dd_app_key
        self.__dd_api_key = dd_api_key
        self.dd_api_domain = dd_api_domain

        self.headers = {
            'Content-Type': 'application/json',
            'DD-API-KEY': dd_api_key,
            'DD-APPLICATION-KEY': dd_app_key,
            'Accept': 'application/json'
        }

        if dd_connector_type and dd_connector_type == Source.DATADOG_OAUTH:
            self.headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {dd_app_key}',
                'DD-API-KEY': dd_api_key,
                'Accept': 'application/json'
            }

        if dd_api_domain:
            self.__dd_host = 'https://api.{}'.format(dd_api_domain)
        else:
            self.__dd_host = 'https://api.{}'.format('datadoghq.com')
        self.dd_dependencies_url = self.__dd_host + "/api/v1/service_dependencies"
        self.dd_connector_type = dd_connector_type

    def get_connection(self):
        try:
            configuration = Configuration()
            configuration.api_key["apiKeyAuth"] = self.__dd_api_key
            if self.dd_connector_type == Source.DATADOG_OAUTH:
                configuration.access_token = self.__dd_app_key
            else:
                configuration.api_key["appKeyAuth"] = self.__dd_app_key
            if self.dd_api_domain:
                configuration.server_variables["site"] = self.dd_api_domain
            configuration.unstable_operations["query_timeseries_data"] = True
            configuration.compress = False
            configuration.enable_retry = True
            configuration.max_retries = 20
            return configuration
        except Exception as e:
            logger.error(f"Error while initializing Datadog API Processor: {e}")
            raise Exception("Error while initializing Datadog API Processor: {}".format(e))

    def test_connection(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = AuthenticationApi(api_client)
                response: AuthenticationValidationResponse = api_instance.validate()
                if not response.get('valid', False):
                    return False
                if self.dd_connector_type and self.dd_connector_type == Source.DATADOG:
                    try:
                        api_instance = MonitorsApi(api_client)
                        monitor_response = api_instance.list_monitors()
                        if monitor_response is None:
                            return False
                    except Exception as e:
                        raise e
                return True
        except ApiException as e:
            logger.error("Exception when calling AuthenticationApi->validate: %s\n" % e)
            raise e

    def fetch_metric_timeseries(self, tr: TimeRange, specific_metric, interval=300000):
        metric_queries = specific_metric.get('queries', None)
        formulas = specific_metric.get('formulas', None)
        from_tr = int(tr.time_geq * 1000)
        to_tr = int(tr.time_lt * 1000)
        if not metric_queries:
            return None
        query_formulas: [QueryFormula] = []
        if formulas:
            for f in formulas:
                query_formulas.append(
                    QueryFormula(formula=f['formula'], limit=FormulaLimit(count=10, order=QuerySortOrder.DESC)))

        timeseries_queries: [MetricsTimeseriesQuery] = []
        for query in metric_queries:
            timeseries_queries.append(MetricsTimeseriesQuery(
                data_source=MetricsDataSource.METRICS,
                name=query['name'],
                query=query['query']
            ))

        body = TimeseriesFormulaQueryRequest(
            data=TimeseriesFormulaRequest(
                attributes=TimeseriesFormulaRequestAttributes(
                    formulas=query_formulas,
                    _from=from_tr,
                    interval=interval,
                    queries=TimeseriesFormulaRequestQueries(timeseries_queries),
                    to=to_tr,
                ),
                type=TimeseriesFormulaRequestType.TIMESERIES_REQUEST,
            ),
        )
        configuration = self.get_connection()
        with ApiClient(configuration) as api_client:
            api_instance = MetricsApi(api_client)
            try:
                response: TimeseriesFormulaQueryResponse = api_instance.query_timeseries_data(body=body)
                if response:
                    result = response.data.attributes
                    return result
            except Exception as e:
                logger.error(f"Exception occurred while fetching metric timeseries with error: {e}")
                raise e

    def fetch_monitor_details(self, monitor_id):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = MonitorsApi(api_client)
                response = api_instance.get_monitor(monitor_id)
                return response
        except Exception as e:
            logger.error(f"Exception occurred while fetching monitor details with error: {e}")
            raise e

    def get_metric_data(self, start, end, query):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = MetricsApi(api_client)
                metric_data = api_instance.query_metrics(int(start), int(end), query)
                return metric_data
        except Exception as e:
            logger.error(e)
            raise e

    def get_metric_data_using_api(self, start, end, interval, queries, query_formula):
        url = self.__dd_host + "/api/v2/query/timeseries"
        payload_dict = {"data": {
            "attributes": {"formulas": query_formula, "from": start, "interval": interval * 1000,
                           "queries": queries, "to": end}, "type": "timeseries_request"}}

        result_dict = {}
        response = requests.request("POST", url, headers=self.headers, json=payload_dict)
        logger.info("Datadog R2D2 Handler Log:: Query V2 TS API", {"response": response.status_code})
        if response.status_code == 429:
            logger.info('Datadog R2D2 Handler Log:: Query V2 TS API Response: 429. response.headers', response.headers)

        if response.status_code == 200:
            response_json = json.loads(response.text)
            series = response_json['data']['attributes']['series']
            data = response_json['data']['attributes']['values']
            num_of_series = len(series)
            num_of_data = len(data)
            if num_of_series == num_of_data:
                for i in range(num_of_series):
                    series_labels = series[i]['group_tags']
                    if not series_labels:
                        series_labels = ['*']
                    series_data = data[i]
                    if len(series_labels) == len(series_data):
                        for j in range(len(series_labels)):
                            result_dict[series_labels[j]] = series_data[j]
        return result_dict

    def get_downstream_services(self, service_name, env):
        url = self.dd_dependencies_url + "/{}?env={}".format(service_name, env)
        response = requests.request("GET", url, headers=self.headers)
        return json.loads(response.text).get('calls', [])

    def get_upstream_services(self, service_name, env):
        url = self.dd_dependencies_url + "/{}?env={}".format(service_name, env)
        response = requests.request("GET", url, headers=self.headers)
        return json.loads(response.text).get('called_by', [])

    def fetch_monitors(self):
        try:
            with ApiClient(self.configuration) as api_client:
                api_instance = MonitorsApi(api_client)
                response = api_instance.list_monitors()
                return response
        except Exception as e:
            logger.error(f"Exception occurred while fetching monitors with error: {e}")
            raise e

    def fetch_dashboards(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = DashboardsApi(api_client)
                response = api_instance.list_dashboards()
                return response.to_dict()
        except Exception as e:
            logger.error(f"Exception occurred while fetching dashboards with error: {e}")
            raise e

    def fetch_dashboard_details(self, dashboard_id):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = DashboardsApi(api_client)
                response = api_instance.get_dashboard(
                    dashboard_id=dashboard_id,
                )
                return response.to_dict()
        except Exception as e:
            logger.error(f"Exception occurred while fetching dashboard details with error: {e}")
            raise e

    def fetch_aws_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = AWSIntegrationApi(api_client)
                response = api_instance.list_aws_accounts()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling AWSIntegrationApi->list_aws_accounts: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching AWS integrations with error: {e}")
            raise e

    def fetch_aws_log_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = AWSLogsIntegrationApi(api_client)
                response = api_instance.list_aws_logs_integrations()
                return response
        except ApiException as e:
            logger.error("Exception when calling AWSLogsIntegrationApi->list_aws_logs_integrations: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching AWS log integrations with error: {e}")
            raise e

    def fetch_azure_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = AzureIntegrationApi(api_client)
                response: AzureAccountListResponse = api_instance.list_azure_integration()
                return response
        except ApiException as e:
            logger.error("Exception when calling AzureIntegrationApi->list_azure_integration: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching Azure integrations with error: {e}")
            raise e

    def fetch_cloudflare_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = CloudflareIntegrationApi(api_client)
                response = api_instance.list_cloudflare_accounts()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling CloudflareIntegrationApi->list_cloudflare_accounts: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching Cloudflare integrations with error: {e}")
            raise e

    def fetch_confluent_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = ConfluentCloudApi(api_client)
                response = api_instance.list_confluent_account()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling ConfluentCloudApi->list_confluent_account: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching Confluent integrations with error: {e}")
            raise e

    def fetch_fastly_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = FastlyIntegrationApi(api_client)
                response = api_instance.list_fastly_accounts()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling FastlyIntegrationApi->list_fastly_accounts: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching Fastly integrations with error: {e}")
            raise e

    def fetch_gcp_integrations(self):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = GCPIntegrationApi(api_client)
                response = api_instance.list_gcpsts_accounts()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling GCPIntegrationApi->list_gcpsts_accounts: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching GCP integrations with error: {e}")
            raise e

    def fetch_service_map(self, env):
        try:
            url = self.dd_dependencies_url + "/?env={}".format(env)
            response = requests.request("GET", url, headers=self.headers)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Exception occurred while fetching service map with error: {e}")
            raise e

    def fetch_metrics(self, filter_tags=None):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = MetricsApi(api_client)
                if filter_tags:
                    response = api_instance.list_tag_configurations(filter_tags=filter_tags)
                else:
                    response = api_instance.list_tag_configurations()
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling MetricsApi->list_tag_configurations: %s\n" % e)
            raise e
        except Exception as e:
            logger.error(f"Exception occurred while fetching metrics with error: {e}")
            raise e

    def fetch_metric_tags(self, metric_name):
        try:
            configuration = self.get_connection()
            with ApiClient(configuration) as api_client:
                api_instance = MetricsApi(api_client)
                response = api_instance.list_tags_by_metric_name(metric_name=metric_name)
                return response.to_dict()
        except ApiException as e:
            logger.error("Exception when calling MetricsApi->list_tags_by_metric_name: %s\n" % e)
            raise e
        except Exception as e:
            logger.error("Exception occurred while fetching metric tags with error: %s\n" % e)
            raise e
