from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.models import Connector, ConnectorKey
from executor.metric_task_executor.playbook_metric_task_executor import PlaybookMetricTaskExecutor
from integrations_api_processors.datadog_api_processor import DatadogApiProcessor
from protos.base_pb2 import TimeRange
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookDatadogTask as PlaybookDatadogTaskProto, PlaybookMetricTaskExecutionResult


class DatadogMetricTaskExecutor(PlaybookMetricTaskExecutor):

    def __init__(self, account_id):
        self.source = PlaybookMetricTaskDefinitionProto.Source.DATADOG
        self.task_type_callable_map = {
            PlaybookDatadogTaskProto.TaskType.SERVICE_METRIC_EXECUTION: self.execute_service_metric_execution_task,
            PlaybookDatadogTaskProto.TaskType.QUERY_METRIC_EXECUTION: self.execute_query_metric_execution_task,
        }

        self.__account_id = account_id

        try:
            dd_connector = Connector.objects.get(account_id=account_id,
                                                 connector_type=ConnectorTypeProto.DATADOG,
                                                 is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Datadog connector not found for account: " + account_id)
        if not dd_connector:
            raise Exception("Active Datadog connector not found for account: " + account_id)

        dd_connector_keys = ConnectorKey.objects.filter(connector_id=dd_connector.id,
                                                        account_id=account_id,
                                                        is_active=True)
        if not dd_connector:
            raise Exception("New Relic connector key not found for account: " + account_id)

        self.__dd_connector_type = dd_connector.connector_type
        for key in dd_connector_keys:
            if key.key_type == ConnectorKeyProto.KeyType.DATADOG_APP_KEY:
                self.__dd_app_key = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.DATADOG_API_KEY:
                self.__dd_api_key = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.DATADOG_API_DOMAIN:
                self.__dd_api_domain = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.DATADOG_AUTH_TOKEN:
                self.__dd_api_key = key.key

        if not self.__dd_app_key or not self.__dd_api_key:
            raise Exception("Datadog API key or app key not found for account: " + account_id)
        if not self.__dd_api_domain:
            self.__dd_api_domain = 'datadoghq.com'

    def execute(self, time_range: TimeRange, global_variable_set: Dict,
                task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
        dd_task = task.datadog_task
        task_type = dd_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, dd_task)
            except Exception as e:
                raise Exception(f"Error while executing Datadog task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_service_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
                                              dd_task: PlaybookDatadogTaskProto) -> PlaybookMetricTaskExecutionResult:
        task_execution_result = PlaybookMetricTaskExecutionResult()

        task = dd_task.service_metric_execution_task
        service_name = task.service_name.value
        env_name = task.environment_name.value
        metric = task.metric.value
        query_tags = f"service:{service_name},env:{env_name}"
        metric_query = f'avg:{metric}{{{query_tags}}}'
        specific_metric = {"queries": [
            {
                "name": "query1",
                "query": metric_query
            }
        ]}

        dd_api_processor = DatadogApiProcessor(self.__dd_app_key, self.__dd_api_key, self.__dd_api_domain,
                                               self.__dd_connector_type)
        print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Time Range -> {}, Query -> {}".format(
            "Datadog", self.__account_id, time_range, metric_query
        ), flush=True)
        results = dd_api_processor.fetch_metric_timeseries(time_range, specific_metric)
        if not results:
            raise Exception("No data returned from Datadog")

        process_function = task.process_function.value
        if process_function == 'timeseries':
            labeled_metric_timeseries: [
                PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries] = []

            for itr, item in enumerate(results.series.value):
                group_tags = item.group_tags.value
                metric_labels: [PlaybookMetricTaskExecutionResult.Result.GroupByLabelValue] = []
                if item.unit:
                    unit = item.unit[0].name
                else:
                    unit = ''
                for gt in group_tags:
                    metric_labels.append(
                        PlaybookMetricTaskExecutionResult.Result.GroupByLabelValue(
                            name=StringValue(value='resource_name'),
                            value=StringValue(value=gt)))

                times = results.times.value
                values = results.values.value[itr].value
                datapoints: [PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries.Datapoint] = []
                for it, val in enumerate(values):
                    datapoints.append(
                        PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(times[it]),
                            value=DoubleValue(value=val)
                        ))

                labeled_metric_timeseries.append(
                    PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries(
                        metric_label_values=metric_labels,
                        unit=StringValue(value=unit),
                        datapoints=datapoints
                    ))

            result = PlaybookMetricTaskExecutionResult.Result(
                type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
                timeseries=PlaybookMetricTaskExecutionResult.Result.Timeseries(
                    labeled_metric_timeseries=labeled_metric_timeseries))

            task_execution_result = PlaybookMetricTaskExecutionResult(
                metric_source=PlaybookMetricTaskDefinitionProto.Source.DATADOG,
                metric_expression=StringValue(value=metric),
                metric_name=StringValue(value=service_name),
                result=result)

        return task_execution_result

    def execute_query_metric_execution_task(self, time_range: TimeRange, global_variable_set: Dict,
                                            dd_task: PlaybookDatadogTaskProto) -> PlaybookMetricTaskExecutionResult:
        task_execution_result = PlaybookMetricTaskExecutionResult()

        task = dd_task.query_metric_execution_task

        queries = task.queries
        formula = task.formula.value

        queries_list = [
            {
                "query": query,
                "name": "a" if i == 0 else "b"
            } for i, query in enumerate(queries)
        ]

        specific_metric = {
            "queries": queries_list,
            "formulas": [
                {
                    "formula": formula
                }
            ] if formula else None
        }

        dd_api_processor = DatadogApiProcessor(self.__dd_app_key, self.__dd_api_key, self.__dd_api_domain,
                                               self.__dd_connector_type)
        print(
            "Playbook Task Downstream Request: Type -> {}, Account -> {}, Time Range -> {}, Queries -> {}, Formula -> "
            "{}".format(
                "Datadog", self.__account_id, time_range, queries, formula
            ), flush=True)
        results = dd_api_processor.fetch_metric_timeseries(time_range, specific_metric)
        if not results:
            raise Exception("No data returned from Datadog")

        process_function = task.process_function.value
        if process_function == 'timeseries':
            labeled_metric_timeseries: [
                PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries] = []

            for itr, item in enumerate(results.series.value):
                group_tags = item.group_tags.value
                metric_labels: [PlaybookMetricTaskExecutionResult.Result.GroupByLabelValue] = []
                if item.unit:
                    unit = item.unit[0].name
                else:
                    unit = ''
                for gt in group_tags:
                    metric_labels.append(
                        PlaybookMetricTaskExecutionResult.Result.GroupByLabelValue(
                            name=StringValue(value='resource_name'),
                            value=StringValue(value=gt)))

                times = results.times.value
                values = results.values.value[itr].value
                datapoints: [PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries.Datapoint] = []
                for it, val in enumerate(values):
                    datapoints.append(
                        PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries.Datapoint(
                            timestamp=int(times[it]),
                            value=DoubleValue(value=val)
                        ))

                labeled_metric_timeseries.append(
                    PlaybookMetricTaskExecutionResult.Result.Timeseries.LabeledMetricTimeseries(
                        metric_label_values=metric_labels,
                        unit=StringValue(value=unit),
                        datapoints=datapoints
                    ))

            result = PlaybookMetricTaskExecutionResult.Result(
                type=PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES,
                timeseries=PlaybookMetricTaskExecutionResult.Result.Timeseries(
                    labeled_metric_timeseries=labeled_metric_timeseries))

            task_execution_result = PlaybookMetricTaskExecutionResult(
                metric_source=PlaybookMetricTaskDefinitionProto.Source.DATADOG,
                result=result)

        return task_execution_result
