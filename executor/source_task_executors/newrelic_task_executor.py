import re
from datetime import datetime
from typing import Dict

import pytz
from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.source_task_definitions.new_relic_task_pb2 import NewRelic


def get_nrql_expression_result_alias(nrql_expression):
    pattern = r'AS\s+\'(.*?)\'|AS\s+(\w+)'
    match = re.search(pattern, nrql_expression, re.IGNORECASE)
    if match:
        return match.group(1) or match.group(2)
    return 'result'


class NewRelicSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.NEW_RELIC
        self.task_proto = NewRelic
        self.task_type_callable_map = {
            NewRelic.TaskType.ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION: {
                'task_type': 'ENTITY_APPLICATION_GOLDEN_METRIC_EXECUTION',
                'executor': self.execute_entity_application_golden_metric_execution,
                'model_types': [SourceModelType.NEW_RELIC_ENTITY_APPLICATION],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a New Relic golden metric',
                'category': 'Metrics'
            },
            NewRelic.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION: {
                'task_type': 'ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION',
                'executor': self.execute_entity_dashboard_widget_nrql_metric_execution,
                'model_types': [SourceModelType.NEW_RELIC_ENTITY_DASHBOARD],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a metric from New Relic dashboard',
                'category': 'Metrics'
            },
            NewRelic.TaskType.NRQL_METRIC_EXECUTION: {
                'task_type': 'NRQL_METRIC_EXECUTION',
                'executor': self.execute_nrql_metric_execution,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a custom NRQL query',
                'category': 'Metrics'
            },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return NewRelicGraphQlConnector(**generated_credentials)

    def execute_entity_application_golden_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                                           nr_task: NewRelic,
                                                           nr_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not nr_connector:
                raise Exception("Task execution Failed:: No New Relic source found")

            task_result = PlaybookTaskResult()

            task = nr_task.entity_application_golden_metric_execution
            name = task.golden_metric_name.value
            unit = task.golden_metric_unit.value

            nrql_expression = task.golden_metric_nrql_expression.value
            if 'timeseries' not in nrql_expression.lower():
                raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
            if 'limit max timeseries' in nrql_expression.lower():
                if 'LIMIT MAX TIMESERIES' in nrql_expression:
                    nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
                else:
                    nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
            if 'since' not in nrql_expression.lower():
                time_since = time_range.time_geq
                time_until = time_range.time_lt
                total_seconds = (time_until - time_since)
                nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'

            result_alias = get_nrql_expression_result_alias(nrql_expression)

            nr_gql_processor = self.get_connector_processor(nr_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Nrql_Expression -> {}".format(
                    "NewRelic", nr_connector.account_id.value, nrql_expression), flush=True)

            response = nr_gql_processor.execute_nrql_query(nrql_expression)
            if not response or 'results' not in response:
                raise Exception("No data returned from New Relic")

            results = []
            if response and 'results' in response:
                results = response['results']
            process_function = task.process_function.value
            if process_function == 'timeseries':
                metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                for item in results:
                    utc_timestamp = item['beginTimeSeconds']
                    utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                    utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                    val = item.get(result_alias)
                    datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                        timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                    metric_datapoints.append(datapoint)

                labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(unit=StringValue(value=unit),
                                                                                     datapoints=metric_datapoints)

                timeseries_result = TimeseriesResult(
                    metric_expression=StringValue(value=nrql_expression),
                    metric_name=StringValue(value=name),
                    labeled_metric_timeseries=[labeled_metric_timeseries]
                )
                task_result = PlaybookTaskResult(
                    type=PlaybookTaskResultType.TIMESERIES,
                    timeseries=timeseries_result,
                    source=self.source
                )

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing New Relic task: {e}")

    def execute_entity_dashboard_widget_nrql_metric_execution(self, time_range: TimeRange,
                                                              global_variable_set: Dict,
                                                              nr_task: NewRelic,
                                                              nr_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not nr_connector:
                raise Exception("Task execution Failed:: No New Relic source found")

            task_result = PlaybookTaskResult()

            task = nr_task.entity_dashboard_widget_nrql_metric_execution
            metric_name = task.widget_title.value
            if task.unit and task.unit.value:
                unit = task.unit.value
            else:
                unit = ''

            nrql_expression = task.widget_nrql_expression.value
            if 'timeseries' not in nrql_expression.lower():
                raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
            if 'limit max timeseries' in nrql_expression.lower():
                if 'LIMIT MAX TIMESERIES' in nrql_expression:
                    nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
                else:
                    nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
            if 'since' not in nrql_expression.lower():
                time_since = time_range.time_geq
                time_until = time_range.time_lt
                total_seconds = (time_until - time_since)
                nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'

            nr_gql_processor = self.get_connector_processor(nr_connector)
            response = nr_gql_processor.execute_nrql_query(nrql_expression)
            if not response:
                raise Exception("No data returned from New Relic")

            results = None
            facet_keys = []
            if response and 'metadata' in response and 'facets' in response['metadata']:
                facet_keys = response['metadata']['facets']
            if response and 'rawResponse' in response:
                results = response['rawResponse']
            process_function = task.process_function.value
            if process_function == 'timeseries' and 'TIMESERIES' in nrql_expression:
                labeled_metric_timeseries_list = []
                metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                if facet_keys:
                    results = results['facets']
                else:
                    results = [results]
                for item in results:
                    metric_label_values = []
                    if 'name' in item:
                        facets = []
                        name = item['name']
                        if isinstance(name, str):
                            facets = [name]
                        elif isinstance(name, list):
                            facets = name
                        if len(facets) > 0 and len(facets) == len(facet_keys):
                            for idx, f in enumerate(facets):
                                metric_label_values.append(LabelValuePair(name=StringValue(value=facet_keys[idx]),
                                                                          value=StringValue(value=f)))
                    time_series = item['timeSeries']
                    for ts in time_series:
                        utc_timestamp = ts['beginTimeSeconds']
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                        ts_results = ts['results']
                        val = None
                        for k, v in ts_results[0].items():
                            val = v

                        if val:
                            dp = val
                        else:
                            dp = 0
                        datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=dp))
                        metric_datapoints.append(datapoint)

                    labeled_metric_timeseries_list.append(
                        TimeseriesResult.LabeledMetricTimeseries(metric_label_values=metric_label_values,
                                                                 unit=StringValue(value=unit),
                                                                 datapoints=metric_datapoints))

                timeseries_result = TimeseriesResult(
                    metric_expression=StringValue(value=nrql_expression),
                    metric_name=StringValue(value=metric_name),
                    labeled_metric_timeseries=labeled_metric_timeseries_list
                )
                task_result = PlaybookTaskResult(
                    type=PlaybookTaskResultType.TIMESERIES,
                    timeseries=timeseries_result,
                    source=self.source
                )

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing New Relic task: {e}")

    def execute_nrql_metric_execution(self, time_range: TimeRange, global_variable_set: Dict, nr_task: NewRelic,
                                      nr_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not nr_connector:
                raise Exception("Task execution Failed:: No New Relic source found")

            task_result = PlaybookTaskResult()

            task = nr_task.nrql_metric_execution
            metric_name = task.metric_name.value
            if task.unit and task.unit.value:
                unit = task.unit.value
            else:
                unit = ''

            nrql_expression = task.nrql_expression.value
            if 'timeseries' not in nrql_expression.lower():
                raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
            for key, value in global_variable_set.items():
                nrql_expression = nrql_expression.replace(key, str(value))
            if 'limit max timeseries' in nrql_expression.lower():
                if 'LIMIT MAX TIMESERIES' in nrql_expression:
                    nrql_expression = nrql_expression.replace('LIMIT MAX TIMESERIES', 'TIMESERIES 5 MINUTE')
                else:
                    nrql_expression = nrql_expression.replace('limit max timeseries', 'TIMESERIES 5 MINUTE')
            if 'since' not in nrql_expression.lower():
                time_since = time_range.time_geq
                time_until = time_range.time_lt
                total_seconds = (time_until - time_since)
                nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'

            nr_gql_processor = self.get_connector_processor(nr_connector)
            response = nr_gql_processor.execute_nrql_query(nrql_expression)
            if not response:
                raise Exception("No data returned from New Relic")

            results = None
            facet_keys = []
            if response and 'metadata' in response and 'facets' in response['metadata']:
                facet_keys = response['metadata']['facets']
            if response and 'rawResponse' in response:
                results = response['rawResponse']
            process_function = task.process_function.value
            if process_function == 'timeseries' and 'TIMESERIES' in nrql_expression:
                labeled_metric_timeseries_list = []
                metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                if facet_keys:
                    results = results['facets']
                else:
                    results = [results]
                for item in results:
                    metric_label_values = []
                    if 'name' in item:
                        facets = []
                        name = item['name']
                        if isinstance(name, str):
                            facets = [name]
                        elif isinstance(name, list):
                            facets = name
                        if len(facets) > 0 and len(facets) == len(facet_keys):
                            for idx, f in enumerate(facets):
                                metric_label_values.append(LabelValuePair(name=StringValue(value=facet_keys[idx]),
                                                                          value=StringValue(value=f)))
                    time_series = item['timeSeries']
                    for ts in time_series:
                        utc_timestamp = ts['beginTimeSeconds']
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                        ts_results = ts['results']
                        val = None
                        for k, v in ts_results[0].items():
                            val = v

                        if val:
                            dp = val
                        else:
                            dp = 0
                        datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000),
                            value=DoubleValue(value=dp)
                        )
                        metric_datapoints.append(datapoint)

                    labeled_metric_timeseries_list.append(
                        TimeseriesResult.LabeledMetricTimeseries(metric_label_values=metric_label_values,
                                                                 unit=StringValue(value=unit),
                                                                 datapoints=metric_datapoints))

                timeseries_result = TimeseriesResult(
                    metric_expression=StringValue(value=nrql_expression),
                    metric_name=StringValue(value=metric_name),
                    labeled_metric_timeseries=labeled_metric_timeseries_list
                )
                task_result = PlaybookTaskResult(
                    type=PlaybookTaskResultType.TIMESERIES,
                    timeseries=timeseries_result,
                    source=self.source
                )

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing New Relic task: {e}")
