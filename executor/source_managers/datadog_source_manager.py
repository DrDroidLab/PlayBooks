from google.protobuf.wrappers_pb2 import DoubleValue, StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.datadog_api_processor import DatadogApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.source_task_definitions.datadog_task_pb2 import Datadog
from protos.ui_definition_pb2 import FormField, FormFieldType


class DatadogSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.DATADOG
        self.task_proto = Datadog
        self.task_type_callable_map = {
            Datadog.TaskType.SERVICE_METRIC_EXECUTION: {
                'executor': self.execute_service_metric_execution,
                'model_types': [SourceModelType.DATADOG_SERVICE],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a Datadog Metric by service',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="service_name"),
                              display_name=StringValue(value="Service"),
                              description=StringValue(value='Select Service'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="environment_name"),
                              display_name=StringValue(value="Environment"),
                              description=StringValue(value='Select Environment'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="metric_family"),
                              display_name=StringValue(value="Metric Family"),
                              description=StringValue(value='Select Metric Family'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="metric"),
                              display_name=StringValue(value="Metric"),
                              description=StringValue(value='Select Metric'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_MULTIPLE_FT),
                ]
            },
            Datadog.TaskType.QUERY_METRIC_EXECUTION: {
                'executor': self.execute_query_metric_execution,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a Datadog custom metric',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="queries"),
                              display_name=StringValue(value="Queries"),
                              description=StringValue(value='Enter Queries'),
                              data_type=LiteralType.STRING_ARRAY,
                              max_length_allowed=UInt64Value(value=2),
                              form_field_type=FormFieldType.STRING_ARRAY_FT),
                    FormField(key_name=StringValue(value="formula"),
                              display_name=StringValue(value="Formula"),
                              description=StringValue(value='Select Formula'),
                              data_type=LiteralType.STRING,
                              is_optional=True,
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
        }

    def get_connector_processor(self, datadog_connector, **kwargs):
        generated_credentials = generate_credentials_dict(datadog_connector.type, datadog_connector.keys)
        if 'dd_api_domain' not in generated_credentials:
            generated_credentials['dd_api_domain'] = 'datadoghq.com'
        return DatadogApiProcessor(**generated_credentials)

    def execute_service_metric_execution(self, time_range: TimeRange, dd_task: Datadog,
                                         datadog_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not datadog_connector:
                raise Exception("Task execution Failed:: No Datadog source found")

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

            dd_api_processor = self.get_connector_processor(datadog_connector)

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Time Range -> {}, Query -> {}".format(
                "Datadog", datadog_connector.account_id.value, time_range, metric_query), flush=True)

            results = dd_api_processor.fetch_metric_timeseries(time_range, specific_metric)
            if not results:
                raise Exception("No data returned from Datadog")

            process_function = task.process_function.value
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
        except Exception as e:
            raise Exception(f"Error while executing Datadog task: {e}")

    def execute_query_metric_execution(self, time_range: TimeRange, dd_task: Datadog,
                                       datadog_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not datadog_connector:
                raise Exception("Task execution Failed:: No Datadog source found")

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

            dd_api_processor = self.get_connector_processor(datadog_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Time Range -> {}, Queries -> {}, Formula -> "
                "{}".format("Datadog", datadog_connector.account_id.value, time_range, queries, formula), flush=True)

            results = dd_api_processor.fetch_metric_timeseries(time_range, specific_metric)
            if not results:
                raise Exception("No data returned from Datadog")

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

            list_of_queries = ",".join(queries)
            timeseries_result = TimeseriesResult(metric_expression=StringValue(value=list_of_queries),
                                                 metric_name=StringValue(value=""),
                                                 labeled_metric_timeseries=labeled_metric_timeseries)

            task_result = PlaybookTaskResult(
                type=PlaybookTaskResultType.TIMESERIES,
                timeseries=timeseries_result,
                source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Datadog task: {e}")
