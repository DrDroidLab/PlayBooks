from datetime import datetime
from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.models import Connector, ConnectorKey
from executor.playbook_task_executor import PlaybookTaskExecutor
from integrations_api_processors.grafana_api_processor import GrafanaApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceKeyType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.grafana_task_pb2 import Grafana


class GrafanaTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.GRAFANA
        self.__account_id = account_id
        self.task_type_callable_map = {
            Grafana.TaskType.PROMQL_METRIC_EXECUTION: self.execute_promql_metric_execution
        }

        try:
            grafana_connector = Connector.objects.get(account_id=account_id,
                                                      connector_type=Source.GRAFANA,
                                                      is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Grafana connector not found for account: {}".format(account_id))
        if not grafana_connector:
            raise Exception("Active Grafana connector not found for account: {}".format(account_id))

        grafana_connector_keys = ConnectorKey.objects.filter(connector_id=grafana_connector.id,
                                                             account_id=account_id,
                                                             is_active=True)
        if not grafana_connector_keys:
            raise Exception("Active Grafana connector keys not found for account: {}".format(account_id))

        self.__ssl_verify = True
        for key in grafana_connector_keys:
            if key.key_type == SourceKeyType.GRAFANA_API_KEY:
                self.__grafana_api_key = key.key
            elif key.key_type == SourceKeyType.GRAFANA_HOST:
                self.__grafana_host = key.key
            elif key.key_type == SourceKeyType.SSL_VERIFY:
                if key.key.lower() == 'false':
                    self.__ssl_verify = False

        if not self.__grafana_api_key or not self.__grafana_host:
            raise Exception("Grafana API key or host not found for account: {}".format(account_id))

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        grafana_task: Grafana = task.grafana
        task_type = grafana_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, grafana_task)
            except Exception as e:
                raise Exception(f"Error while executing Grafana task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_promql_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                        grafana_task: Grafana) -> PlaybookTaskResult:
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
        for key, value in global_variable_set.items():
            promql_metric_query = promql_metric_query.replace(key, str(value))

        grafana_api_processor = GrafanaApiProcessor(self.__grafana_host, self.__grafana_api_key, self.__ssl_verify)

        print(
            "Playbook Task Downstream Request: Type -> {}, Account -> {}, Datasource_Uid -> {}, Promql_Metric_Query -> {}, Start_Time "
            "-> {}, End_Time -> {}, Period -> {}".format(
                "Grafana", self.__account_id, datasource_uid, promql_metric_query, start_time, end_time, period
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
