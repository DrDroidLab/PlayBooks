from datetime import datetime
from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.grafana_api_processor import GrafanaApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.source_task_definitions.grafana_task_pb2 import Grafana


class GrafanaSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GRAFANA
        self.task_proto = Grafana
        self.task_type_callable_map = {
            Grafana.TaskType.PROMQL_METRIC_EXECUTION: {
                'executor': self.execute_promql_metric_execution,
                'model_types': [SourceModelType.GRAFANA_TARGET_METRIC_PROMQL],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Query any of your Prometheus based dashboard panels from Grafana',
                'category': 'Metrics'
            },
            Grafana.TaskType.PROMETHEUS_DATASOURCE_METRIC_EXECUTION: {
                'executor': self.execute_prometheus_datasource_metric_execution,
                'model_types': [SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Query any of your Prometheus Data Sources from Grafana',
                'category': 'Metrics'
            },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return GrafanaApiProcessor(**generated_credentials)

    def execute_promql_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                        grafana_task: Grafana, grafana_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not grafana_connector:
                raise Exception("Task execution Failed:: No Grafana source found")

            tr_end_time = time_range.time_lt
            tr_start_time = time_range.time_geq
            current_datetime = datetime.utcfromtimestamp(tr_end_time)
            evaluation_time = datetime.utcfromtimestamp(tr_start_time)

            end_time = current_datetime.isoformat() + "Z"
            start_time = evaluation_time.isoformat() + "Z"
            period = 300

            task_result = PlaybookTaskResult()
            task = grafana_task.promql_metric_execution

            datasource_uid = task.datasource_uid.value
            process_function = task.process_function.value
            promql_metric_query = task.promql_expression.value
            promql_label_option_values = task.promql_label_option_values

            for label_option in promql_label_option_values:
                promql_metric_query = promql_metric_query.replace(label_option.name.value,
                                                                  label_option.value.value)
            if global_variable_set:
                for key, value in global_variable_set.items():
                    promql_metric_query = promql_metric_query.replace(key, str(value))

            grafana_api_processor = self.get_connector_processor(grafana_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Datasource_Uid -> {}, Promql_Metric_Query -> {}, Start_Time "
                "-> {}, End_Time -> {}, Period -> {}".format(
                    "Grafana", grafana_connector.account_id.value, datasource_uid, promql_metric_query, start_time,
                    end_time, period), flush=True)

            response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                            start_time, end_time, period)
            if not response:
                raise Exception("No data returned from Grafana")

            if process_function == 'timeseries':
                if 'data' in response and 'result' in response['data']:
                    labeled_metric_timeseries_list = []
                    for item in response['data']['result']:
                        metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                        for value in item['values']:
                            utc_timestamp = value[0]
                            utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                            val = value[1]
                            datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                                timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=float(val)))
                            metric_datapoints.append(datapoint)
                        item_metrics = item['metric']
                        metric_label_values = []
                        for key, value in item_metrics.items():
                            metric_label_values.append(
                                LabelValuePair(name=StringValue(value=key), value=StringValue(value=value)))
                        labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(
                            metric_label_values=metric_label_values, unit=StringValue(value=""),
                            datapoints=metric_datapoints)
                        labeled_metric_timeseries_list.append(labeled_metric_timeseries)

                    timeseries_result = TimeseriesResult(
                        metric_expression=StringValue(value=promql_metric_query),
                        labeled_metric_timeseries=labeled_metric_timeseries_list
                    )

                    task_result = PlaybookTaskResult(
                        source=self.source,
                        type=PlaybookTaskResultType.TIMESERIES,
                        timeseries=timeseries_result)

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Grafana task: {e}")

    def execute_prometheus_datasource_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                                       grafana_task: Grafana,
                                                       grafana_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not grafana_connector:
                raise Exception("Task execution Failed:: No Grafana source found")

            tr_end_time = time_range.time_lt
            tr_start_time = time_range.time_geq
            current_datetime = datetime.utcfromtimestamp(tr_end_time)
            evaluation_time = datetime.utcfromtimestamp(tr_start_time)

            end_time = current_datetime.isoformat() + "Z"
            start_time = evaluation_time.isoformat() + "Z"
            period = 300

            task_result = PlaybookTaskResult()
            task = grafana_task.prometheus_datasource_metric_execution

            datasource_uid = task.datasource_uid.value
            process_function = task.process_function.value
            promql_metric_query = task.promql_expression.value

            if global_variable_set:
                for key, value in global_variable_set.items():
                    promql_metric_query = promql_metric_query.replace(key, str(value))

            grafana_api_processor = self.get_connector_processor(grafana_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Datasource_Uid -> {}, Promql_Metric_Query -> {}, Start_Time "
                "-> {}, End_Time -> {}, Period -> {}".format(
                    "Grafana", grafana_connector.account_id.value, datasource_uid, promql_metric_query, start_time,
                    end_time, period
                ), flush=True)

            response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                            start_time, end_time, period)
            if not response:
                raise Exception("No data returned from Grafana")

            if process_function == 'timeseries':
                if 'data' in response and 'result' in response['data']:
                    labeled_metric_timeseries_list = []
                    for item in response['data']['result']:
                        metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                        for value in item['values']:
                            utc_timestamp = value[0]
                            utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                            val = value[1]
                            datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                                timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=float(val)))
                            metric_datapoints.append(datapoint)
                        item_metrics = item['metric']
                        metric_label_values = []
                        for key, value in item_metrics.items():
                            metric_label_values.append(
                                LabelValuePair(name=StringValue(value=key), value=StringValue(value=value)))
                        labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(
                            metric_label_values=metric_label_values, unit=StringValue(value=""),
                            datapoints=metric_datapoints)
                        labeled_metric_timeseries_list.append(labeled_metric_timeseries)

                    timeseries_result = TimeseriesResult(
                        metric_expression=StringValue(value=promql_metric_query),
                        labeled_metric_timeseries=labeled_metric_timeseries_list
                    )

                    task_result = PlaybookTaskResult(
                        source=self.source,
                        type=PlaybookTaskResultType.TIMESERIES,
                        timeseries=timeseries_result)

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Grafana task: {e}")
