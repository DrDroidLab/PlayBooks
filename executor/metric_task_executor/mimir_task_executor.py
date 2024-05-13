from datetime import datetime
from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.models import Connector, ConnectorKey
from executor.metric_task_executor.playbook_metric_task_executor import PlaybookMetricTaskExecutor
from integrations_api_processors.mimir_api_processor import MimirApiProcessor
from protos.base_pb2 import TimeRange
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookMetricTaskExecutionResult, PlaybookPromQLTask, TimeseriesResult as TimeseriesResultProto, \
    LabelValuePair as LabelValuePairProto


class MimirMetricTaskExecutor(PlaybookMetricTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.GRAFANA_MIMIR
        self.task_type_callable_map = {
            PlaybookPromQLTask.TaskType.PROMQL_METRIC_EXECUTION: self.execute_promql_metric_execution_task
        }

        self.__account_id = account_id

        try:
            mimir_connector = Connector.objects.get(account_id=account_id,
                                                    connector_type=Source.GRAFANA_MIMIR,
                                                    is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Mimir connector not found for account: {}".format(account_id))
        if not mimir_connector:
            raise Exception("Active Mimir connector not found for account: {}".format(account_id))

        mimir_connector_keys = ConnectorKey.objects.filter(connector_id=mimir_connector.id,
                                                           account_id=account_id,
                                                           is_active=True)
        if not mimir_connector_keys:
            raise Exception("Active Mimir connector keys not found for account: {}".format(account_id))

        for key in mimir_connector_keys:
            if key.key_type == ConnectorKeyProto.KeyType.MIMIR_HOST:
                self.__mimir_host = key.key
            if key.key_type == ConnectorKeyProto.KeyType.X_SCOPE_ORG_ID:
                self.__x_scope_org_id = key.key

        if not self.__mimir_host or not self.__x_scope_org_id:
            raise Exception("Mimir host or Scope Org ID not found for account: {}".format(account_id))

    def execute(self, time_range: TimeRange, global_variable_set: Dict,
                task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
        mimir_task = task.mimir_task
        task_type = mimir_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, mimir_task)
            except Exception as e:
                raise Exception(f"Error while executing Mimir task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_promql_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
                                             mimir_task: PlaybookPromQLTask) -> PlaybookMetricTaskExecutionResult:
        tr_end_time = time_range.time_lt
        tr_start_time = time_range.time_geq
        current_datetime = datetime.utcfromtimestamp(tr_end_time)
        evaluation_time = datetime.utcfromtimestamp(tr_start_time)

        end_time = current_datetime.isoformat() + "Z"
        start_time = evaluation_time.isoformat() + "Z"
        period = 300

        task_execution_result = PlaybookMetricTaskExecutionResult()

        task = mimir_task.promql_metric_execution_task
        process_function = task.process_function.value
        promql_metric_query = task.promql_expression.value
        # promql_label_option_values = task.promql_label_option_values
        # for label_option in promql_label_option_values:
        #     promql_metric_query = promql_metric_query.replace(label_option.name.value,
        #                                                       label_option.value.value)
        for key, value in global_variable_set.items():
            promql_metric_query = promql_metric_query.replace(key, str(value))

        mimir_api_processor = MimirApiProcessor(self.__mimir_host, self.__x_scope_org_id)

        print(
            "Playbook Task Downstream Request: Type -> {}, Account -> {}, Promql_Metric_Query -> {}, Start_Time "
            "-> {}, End_Time -> {}, Period -> {}".format(
                "Mimir", self.__account_id, promql_metric_query, start_time, end_time, period
            ), flush=True)

        response = mimir_api_processor.fetch_promql_metric_timeseries(promql_metric_query,
                                                                      start_time, end_time, period)
        if not response:
            raise Exception("No data returned from Mimir")

        if process_function == 'timeseries':
            print('response', response)
            if 'data' in response and 'result' in response['data']:
                labeled_metric_timeseries_list = []
                for item in response['data']['result']:
                    metric_datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint] = []
                    for value in item['values']:
                        utc_timestamp = value[0]
                        utc_datetime = datetime.utcfromtimestamp(utc_timestamp)
                        val = value[1]
                        datapoint = TimeseriesResultProto.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=float(val)))
                        metric_datapoints.append(datapoint)
                    item_metrics = item['metric']
                    metric_label_values = []
                    for key, value in item_metrics.items():
                        metric_label_values.append(
                            LabelValuePairProto(name=StringValue(value=key), value=StringValue(value=value)))
                    labeled_metric_timeseries = TimeseriesResultProto.LabeledMetricTimeseries(
                        metric_label_values=metric_label_values, unit=StringValue(value=""),
                        datapoints=metric_datapoints)
                    labeled_metric_timeseries_list.append(labeled_metric_timeseries)

                result = PlaybookMetricTaskExecutionResult.Result(
                    type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
                    timeseries=TimeseriesResultProto(labeled_metric_timeseries=labeled_metric_timeseries_list))

                task_execution_result = PlaybookMetricTaskExecutionResult(
                    metric_source=Source.GRAFANA_MIMIR,
                    metric_expression=StringValue(value=promql_metric_query),
                    result=result)

        return task_execution_result
