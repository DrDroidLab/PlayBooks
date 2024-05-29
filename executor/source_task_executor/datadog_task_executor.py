from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.models import Connector, ConnectorKey
from executor.playbook_task_executor import PlaybookTaskExecutor
from integrations_api_processors.datadog_api_processor import DatadogApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceKeyType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.datadog_task_pb2 import Datadog


class DatadogTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.DATADOG
        self.task_type_callable_map = {
            Datadog.TaskType.SERVICE_METRIC_EXECUTION: self.execute_service_metric_execution,
            Datadog.TaskType.QUERY_METRIC_EXECUTION: self.execute_query_metric_execution,
        }

        self.__account_id = account_id

        try:
            dd_connector = Connector.objects.get(account_id=account_id,
                                                 connector_type=Source.DATADOG,
                                                 is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Datadog connector not found for account: " + str(account_id))
        if not dd_connector:
            raise Exception("Active Datadog connector not found for account: " + str(account_id))

        dd_connector_keys = ConnectorKey.objects.filter(connector_id=dd_connector.id,
                                                        account_id=account_id,
                                                        is_active=True)
        if not dd_connector:
            raise Exception("New Relic connector key not found for account: " + account_id)

        self.__dd_connector_type = dd_connector.connector_type
        for key in dd_connector_keys:
            if key.key_type == SourceKeyType.DATADOG_APP_KEY:
                self.__dd_app_key = key.key
            elif key.key_type == SourceKeyType.DATADOG_API_KEY:
                self.__dd_api_key = key.key
            elif key.key_type == SourceKeyType.DATADOG_API_DOMAIN:
                self.__dd_api_domain = key.key
            elif key.key_type == SourceKeyType.DATADOG_AUTH_TOKEN:
                self.__dd_api_key = key.key

        if not self.__dd_app_key or not self.__dd_api_key:
            raise Exception("Datadog API key or app key not found for account: " + account_id)
        if not self.__dd_api_domain:
            self.__dd_api_domain = 'datadoghq.com'

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        dd_task: Datadog = task.datadog
        task_type = dd_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, dd_task)
            except Exception as e:
                raise Exception(f"Error while executing Datadog task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_service_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                         dd_task: Datadog) -> PlaybookTaskResult:
        task_result = PlaybookTaskResult()

        task = dd_task.service_metric_execution
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
            labeled_metric_timeseries: [TimeseriesResult.LabeledMetricTimeseries] = []

            for itr, item in enumerate(results.series.value):
                group_tags = item.group_tags.value
                metric_labels: [LabelValuePair] = []
                if item.unit:
                    unit = item.unit[0].name
                else:
                    unit = ''
                for gt in group_tags:
                    metric_labels.append(
                        LabelValuePair(name=StringValue(value='resource_name'), value=StringValue(value=gt)))

                times = results.times.value
                values = results.values.value[itr].value
                datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                for it, val in enumerate(values):
                    datapoints.append(TimeseriesResult.LabeledMetricTimeseries.Datapoint(timestamp=int(times[it]),
                                                                                         value=DoubleValue(
                                                                                             value=val)))

                labeled_metric_timeseries.append(
                    TimeseriesResult.LabeledMetricTimeseries(metric_label_values=metric_labels,
                                                             unit=StringValue(value=unit), datapoints=datapoints))

            timeseries_result = TimeseriesResult(metric_expression=StringValue(value=metric),
                                                 metric_name=StringValue(value=service_name),
                                                 labeled_metric_timeseries=labeled_metric_timeseries)

            task_result = PlaybookTaskResult(
                type=PlaybookTaskResultType.TIMESERIES,
                timeseries=timeseries_result,
                source=self.source)
        return task_result

    def execute_query_metric_execution(self, time_range: TimeRange, global_variable_set: Dict,
                                       dd_task: Datadog) -> PlaybookTaskResult:
        task_result = PlaybookTaskResult()

        task = dd_task.query_metric_execution

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
            labeled_metric_timeseries: [TimeseriesResult.LabeledMetricTimeseries] = []

            for itr, item in enumerate(results.series.value):
                group_tags = item.group_tags.value
                metric_labels: [LabelValuePair] = []
                if item.unit:
                    unit = item.unit[0].name
                else:
                    unit = ''
                for gt in group_tags:
                    metric_labels.append(
                        LabelValuePair(name=StringValue(value='resource_name'), value=StringValue(value=gt)))

                times = results.times.value
                values = results.values.value[itr].value
                datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                for it, val in enumerate(values):
                    datapoints.append(TimeseriesResult.LabeledMetricTimeseries.Datapoint(timestamp=int(times[it]),
                                                                                         value=DoubleValue(
                                                                                             value=val)))

                labeled_metric_timeseries.append(
                    TimeseriesResult.LabeledMetricTimeseries(metric_label_values=metric_labels,
                                                             unit=StringValue(value=unit), datapoints=datapoints))

            timeseries_result = TimeseriesResult(labeled_metric_timeseries=labeled_metric_timeseries)

            task_result = PlaybookTaskResult(
                type=PlaybookTaskResultType.TIMESERIES,
                timeseries=timeseries_result,
                source=self.source)
        return task_result
