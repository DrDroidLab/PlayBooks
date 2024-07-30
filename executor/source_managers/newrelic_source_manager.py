import re
from datetime import datetime

import pytz
from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.new_relic_graph_ql_processor import NewRelicGraphQlConnector
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.new_relic_task_pb2 import NewRelic
from protos.ui_definition_pb2 import FormField


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
                'executor': self.execute_entity_application_golden_metric_execution,
                'model_types': [SourceModelType.NEW_RELIC_ENTITY_APPLICATION],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a New Relic golden metric',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="application_entity_name"),
                              display_name=StringValue(value="Application"),
                              description=StringValue(value="Select Application"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="golden_metric_name"),
                              display_name=StringValue(value="Metric"),
                              description=StringValue(value="Select Metric"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="golden_metric_unit"),
                              display_name=StringValue(value="Unit"),
                              description=StringValue(value="Enter Unit"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="golden_metric_nrql_expression"),
                              display_name=StringValue(value="Selected Query"),
                              data_type=LiteralType.STRING),
                ]
            },
            NewRelic.TaskType.ENTITY_DASHBOARD_WIDGET_NRQL_METRIC_EXECUTION: {
                'executor': self.execute_entity_dashboard_widget_nrql_metric_execution,
                'model_types': [SourceModelType.NEW_RELIC_ENTITY_DASHBOARD],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a metric from New Relic dashboard',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="dashboard_guid"),
                              display_name=StringValue(value="Dashboard"),
                              description=StringValue(value="Select Dashboard"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="page_guid"),
                              display_name=StringValue(value="Page"),
                              description=StringValue(value="Select Page"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="widget_title"),
                              display_name=StringValue(value="Widget Title"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="widget_nrql_expression"),
                              display_name=StringValue(value="Selected Query"),
                              data_type=LiteralType.STRING),
                ]
            },
            NewRelic.TaskType.NRQL_METRIC_EXECUTION: {
                'executor': self.execute_nrql_metric_execution,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a custom NRQL query',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="metric_name"),
                              display_name=StringValue(value="Metric Name"),
                              description=StringValue(value="Enter Metric Name"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="unit"),
                              display_name=StringValue(value="Unit"),
                              description=StringValue(value="Enter Unit"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="nrql_expression"),
                              display_name=StringValue(value="Selected Query"),
                              data_type=LiteralType.STRING),
                ]
            },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return NewRelicGraphQlConnector(**generated_credentials)

    def execute_entity_application_golden_metric_execution(self, time_range: TimeRange, nr_task: NewRelic,
                                                           nr_connector: ConnectorProto,
                                                           execution_configuration: PlaybookTask.ExecutionConfiguration = None) -> PlaybookTaskResult:
        try:
            if not nr_connector:
                raise Exception("Task execution Failed:: No New Relic source found")

            task = nr_task.entity_application_golden_metric_execution
            name = task.golden_metric_name.value
            unit = task.golden_metric_unit.value

            nrql_expression = task.golden_metric_nrql_expression.value
            if 'timeseries' not in nrql_expression.lower():
                raise Exception("Invalid NRQL expression. TIMESERIES is missing in the NRQL expression")
            if 'limit max timeseries' in nrql_expression.lower():
                nrql_expression = re.sub('limit max timeseries', 'TIMESERIES 5 MINUTE', nrql_expression,
                                         flags=re.IGNORECASE)
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

            results = response.get('results', [])
            metric_datapoints = []
            for item in results:
                utc_timestamp = item['beginTimeSeconds']
                utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                val = item.get(result_alias)
                datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                    timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                metric_datapoints.append(datapoint)

            metric_label_values = [
                LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value='0'))
            ]
            labeled_metric_timeseries_list = [
                TimeseriesResult.LabeledMetricTimeseries(
                    metric_label_values=metric_label_values, unit=StringValue(value=unit), datapoints=metric_datapoints)
            ]

            # Process offset values if specified
            if execution_configuration and execution_configuration.timeseries_offset:
                offsets = [offset.value for offset in execution_configuration.timeseries_offset]
                for offset in offsets:
                    adjusted_start_time = time_range.time_geq - offset
                    adjusted_end_time = time_range.time_lt - offset
                    total_seconds = adjusted_end_time - adjusted_start_time
                    adjusted_nrql_expression = re.sub(
                        r'SINCE\s+\d+\s+SECONDS\s+AGO', f'SINCE {total_seconds} SECONDS AGO', nrql_expression)

                    print(
                        "Playbook Task Downstream Request: Type -> {}, Account -> {}, Nrql_Expression -> {}, "
                        "Offset -> {}".format(
                            "NewRelic", nr_connector.account_id.value, adjusted_nrql_expression, offset), flush=True)

                    offset_response = nr_gql_processor.execute_nrql_query(adjusted_nrql_expression)
                    if not offset_response or 'results' not in offset_response:
                        print(f"No data returned from New Relic for offset {offset} seconds")
                        continue

                    offset_results = offset_response.get('results', [])
                    offset_metric_datapoints = []
                    for item in offset_results:
                        utc_timestamp = item['beginTimeSeconds']
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                        val = item.get(result_alias)
                        datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                        offset_metric_datapoints.append(datapoint)

                    offset_metric_label_values = [
                        LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value=str(offset)))
                    ]
                    labeled_metric_timeseries_list.append(
                        TimeseriesResult.LabeledMetricTimeseries(
                            metric_label_values=offset_metric_label_values, unit=StringValue(value=unit),
                            datapoints=offset_metric_datapoints)
                    )

            timeseries_result = TimeseriesResult(
                metric_expression=StringValue(value=nrql_expression),
                metric_name=StringValue(value=name),
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

    def execute_entity_dashboard_widget_nrql_metric_execution(self, time_range: TimeRange, nr_task: NewRelic,
                                                              nr_connector: ConnectorProto,
                                                              execution_configuration: PlaybookTask.ExecutionConfiguration = None) -> PlaybookTaskResult:
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
                nrql_expression = re.sub('limit max timeseries', 'TIMESERIES 5 MINUTE', nrql_expression,
                                         flags=re.IGNORECASE)
            if 'since' not in nrql_expression.lower():
                time_since = time_range.time_geq
                time_until = time_range.time_lt
                total_seconds = (time_until - time_since)
                nrql_expression = nrql_expression + f' SINCE {total_seconds} SECONDS AGO'

            nr_gql_processor = self.get_connector_processor(nr_connector)
            response = nr_gql_processor.execute_nrql_query(nrql_expression)
            if not response:
                raise Exception("No data returned from New Relic")

            labeled_metric_timeseries_list = []
            facet_keys = response.get('metadata', {}).get('facets', [])
            results = response.get('rawResponse', {}).get('facets', [response.get('rawResponse')])

            if 'TIMESERIES' in nrql_expression:
                for item in results:
                    metric_label_values = []
                    if 'name' in item:
                        facets = item['name']
                        if isinstance(facets, str):
                            facets = [facets]
                        if len(facets) == len(facet_keys):
                            for idx, f in enumerate(facets):
                                metric_label_values.append(LabelValuePair(name=StringValue(value=facet_keys[idx]),
                                                                          value=StringValue(value=f)))
                    metric_datapoints = []
                    for ts in item['timeSeries']:
                        utc_timestamp = ts['beginTimeSeconds']
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                        val = ts['results'][0].get(next(iter(ts['results'][0])), 0)
                        datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                        metric_datapoints.append(datapoint)
                    labeled_metric_timeseries_list.append(
                        TimeseriesResult.LabeledMetricTimeseries(metric_label_values=metric_label_values,
                                                                 unit=StringValue(value=unit),
                                                                 datapoints=metric_datapoints))

            # Process offset values if specified
            if execution_configuration and execution_configuration.timeseries_offset:
                offsets = [offset.value for offset in execution_configuration.timeseries_offset]
                for offset in offsets:
                    adjusted_start_time = time_range.time_geq - offset
                    adjusted_end_time = time_range.time_lt - offset
                    total_seconds = adjusted_end_time - adjusted_start_time
                    adjusted_nrql_expression = re.sub(
                        r'SINCE\s+\d+\s+SECONDS\s+AGO', f'SINCE {total_seconds} SECONDS AGO', nrql_expression)

                    print(
                        "Playbook Task Downstream Request: Type -> {}, Account -> {}, Nrql_Expression -> {}, "
                        "Offset -> {}".format(
                            "NewRelic", nr_connector.account_id.value, adjusted_nrql_expression, offset), flush=True)

                    offset_response = nr_gql_processor.execute_nrql_query(adjusted_nrql_expression)
                    if not offset_response:
                        print(f"No data returned from New Relic for offset {offset} seconds")
                        continue

                    facet_keys = offset_response.get('metadata', {}).get('facets', [])
                    results = offset_response.get('rawResponse', {}).get('facets', [offset_response.get('rawResponse')])
                    for item in results:
                        metric_label_values = []
                        if 'name' in item:
                            facets = item['name']
                            if isinstance(facets, str):
                                facets = [facets]
                            if len(facets) == len(facet_keys):
                                for idx, f in enumerate(facets):
                                    metric_label_values.append(LabelValuePair(name=StringValue(value=facet_keys[idx]),
                                                                              value=StringValue(value=f)))
                        metric_datapoints = []
                        for ts in item['timeSeries']:
                            utc_timestamp = ts['beginTimeSeconds']
                            utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                            utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                            val = ts['results'][0].get(next(iter(ts['results'][0])), 0)
                            datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                                timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
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

    def execute_nrql_metric_execution(self, time_range: TimeRange, nr_task: NewRelic,
                                      nr_connector: ConnectorProto,
                                      execution_configuration: PlaybookTask.ExecutionConfiguration = None) -> PlaybookTaskResult:
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

            if 'limit max timeseries' in nrql_expression.lower():
                nrql_expression = re.sub('limit max timeseries', 'TIMESERIES 5 MINUTE', nrql_expression,
                                         flags=re.IGNORECASE)
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
            if not response:
                raise Exception("No data returned from New Relic")

            results = response.get('results', [])
            metric_datapoints = []
            for item in results:
                utc_timestamp = item['beginTimeSeconds']
                utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                val = item.get(result_alias)
                datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                    timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                metric_datapoints.append(datapoint)

            metric_label_values = [
                LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value='0'))
            ]
            labeled_metric_timeseries_list = [
                TimeseriesResult.LabeledMetricTimeseries(
                    metric_label_values=metric_label_values, unit=StringValue(value=unit), datapoints=metric_datapoints)
            ]

            # Process offset values if specified
            if execution_configuration and execution_configuration.timeseries_offset:
                offsets = [offset.value for offset in execution_configuration.timeseries_offset]
                for offset in offsets:
                    adjusted_start_time = time_range.time_geq - offset
                    adjusted_end_time = time_range.time_lt - offset
                    total_seconds = adjusted_end_time - adjusted_start_time
                    adjusted_nrql_expression = re.sub(
                        r'SINCE\s+\d+\s+SECONDS\s+AGO', f'SINCE {total_seconds} SECONDS AGO', nrql_expression)

                    print(
                        "Playbook Task Downstream Request: Type -> {}, Account -> {}, Nrql_Expression -> {}, "
                        "Offset -> {}".format(
                            "NewRelic", nr_connector.account_id.value, adjusted_nrql_expression, offset), flush=True)

                    offset_response = nr_gql_processor.execute_nrql_query(adjusted_nrql_expression)
                    if not offset_response:
                        print(f"No data returned from New Relic for offset {offset} seconds")
                        continue

                    offset_results = offset_response.get('results', [])
                    offset_metric_datapoints = []
                    for item in offset_results:
                        utc_timestamp = item['beginTimeSeconds']
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                        val = item.get(result_alias)
                        datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                        offset_metric_datapoints.append(datapoint)

                    offset_metric_label_values = [
                        LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value=str(offset)))
                    ]
                    labeled_metric_timeseries_list.append(
                        TimeseriesResult.LabeledMetricTimeseries(
                            metric_label_values=offset_metric_label_values, unit=StringValue(value=unit),
                            datapoints=offset_metric_datapoints)
                    )

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
