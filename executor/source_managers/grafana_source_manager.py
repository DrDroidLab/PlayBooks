from datetime import datetime, timedelta

from google.protobuf.wrappers_pb2 import DoubleValue, StringValue

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.grafana_api_processor import GrafanaApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TimeseriesResult, LabelValuePair, \
    PlaybookTaskResultType
from protos.playbooks.source_task_definitions.grafana_task_pb2 import Grafana
from protos.ui_definition_pb2 import FormField, FormFieldType


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
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="datasource_uid"),
                              display_name=StringValue(value="Data Source UID"),
                              description=StringValue(value="Select Data Source UID "),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="promql_expression"),
                              display_name=StringValue(value="PromQL"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="promql_label_option_values"),
                              display_name=StringValue(value="PromQl Labels"),
                              is_composite=True,
                              composite_fields=[
                                  FormField(key_name=StringValue(value="name"),
                                            display_name=StringValue(value="Label Name"),
                                            data_type=LiteralType.STRING),
                                  FormField(key_name=StringValue(value="value"),
                                            display_name=StringValue(value="Label Value"),
                                            data_type=LiteralType.STRING)
                              ]),
                    FormField(key_name=StringValue(value="dashboard_uid"),
                              display_name=StringValue(value="Dashboard UID"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="dashboard_title"),
                              display_name=StringValue(value="Dashboard Title"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="panel_id"),
                              display_name=StringValue(value="Panel ID"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="panel_title"),
                              display_name=StringValue(value="Panel Title"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="panel_promql_expression"),
                              display_name=StringValue(value="Panel PromQL"),
                              data_type=LiteralType.STRING),
                ]
            },
            Grafana.TaskType.PROMETHEUS_DATASOURCE_METRIC_EXECUTION: {
                'executor': self.execute_prometheus_datasource_metric_execution,
                'model_types': [SourceModelType.GRAFANA_PROMETHEUS_DATASOURCE],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Query any of your Prometheus Data Sources from Grafana',
                'category': 'Metrics',
                'form_fields': [
                    FormField(key_name=StringValue(value="datasource_uid"),
                              display_name=StringValue(value="Data Source UID"),
                              description=StringValue(value="Select Data Source UID "),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="promql_expression"),
                              display_name=StringValue(value="PromQL"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                ]
            },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return GrafanaApiProcessor(**generated_credentials)

    def execute_promql_metric_execution(self, time_range: TimeRange, grafana_task: Grafana,
                                        grafana_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not grafana_connector:
                raise Exception("Task execution Failed:: No Grafana source found")

            task = grafana_task.promql_metric_execution
            datasource_uid = task.datasource_uid.value
            promql_metric_query = task.promql_expression.value
            promql_label_option_values = task.promql_label_option_values
            timeseries_offsets = task.timeseries_offsets

            for label_option in promql_label_option_values:
                promql_metric_query = promql_metric_query.replace(label_option.name.value,
                                                                  label_option.value.value)

            grafana_api_processor = self.get_connector_processor(grafana_connector)

            labeled_metric_timeseries_list = []

            # Get current time values
            current_end_time = datetime.utcfromtimestamp(time_range.time_lt)
            current_start_time = datetime.utcfromtimestamp(time_range.time_geq)

            start_time_str = current_start_time.isoformat() + "Z"
            end_time_str = current_end_time.isoformat() + "Z"
            period = 300

            print(
                f"Playbook Task Downstream Request: Type -> Grafana, Datasource_Uid -> {datasource_uid}, "
                f"Promql_Metric_Query -> {promql_metric_query}, Start_Time -> {start_time_str}, "
                f"End_Time -> {end_time_str}, Period -> {period}, Offset -> 0", flush=True)

            response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                            start_time_str, end_time_str, period)
            if response and 'data' in response and 'result' in response['data']:
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
                    metric_label_values.append(
                        LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value='0')))
                    labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(
                        metric_label_values=metric_label_values, unit=StringValue(value=""),
                        datapoints=metric_datapoints)
                    labeled_metric_timeseries_list.append(labeled_metric_timeseries)

            # Get offset values if specified
            if timeseries_offsets:
                offsets = [offset.value for offset in timeseries_offsets]
                for offset in offsets:
                    offset_end_time = current_end_time - timedelta(seconds=offset)
                    offset_start_time = current_start_time - timedelta(seconds=offset)

                    offset_start_time_str = offset_start_time.isoformat() + "Z"
                    offset_end_time_str = offset_end_time.isoformat() + "Z"

                    print(
                        f"Playbook Task Downstream Request: Type -> Grafana, Datasource_Uid -> {datasource_uid}, "
                        f"Promql_Metric_Query -> {promql_metric_query}, Start_Time -> {offset_start_time_str}, "
                        f"End_Time -> {offset_end_time_str}, Period -> {period}, Offset -> {offset}", flush=True)

                    response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                                    offset_start_time_str,
                                                                                    offset_end_time_str, period)
                    if response and 'data' in response and 'result' in response['data']:
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
                            metric_label_values.append(
                                LabelValuePair(name=StringValue(value='offset_seconds'),
                                               value=StringValue(value=str(offset))))
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

    def execute_prometheus_datasource_metric_execution(self, time_range: TimeRange, grafana_task: Grafana,
                                                       grafana_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not grafana_connector:
                raise Exception("Task execution Failed:: No Grafana source found")

            task = grafana_task.prometheus_datasource_metric_execution
            datasource_uid = task.datasource_uid.value
            promql_metric_query = task.promql_expression.value
            timeseries_offsets = task.timeseries_offsets

            grafana_api_processor = self.get_connector_processor(grafana_connector)

            labeled_metric_timeseries_list = []

            # Get current time values
            current_end_time = datetime.utcfromtimestamp(time_range.time_lt)
            current_start_time = datetime.utcfromtimestamp(time_range.time_geq)

            start_time_str = current_start_time.isoformat() + "Z"
            end_time_str = current_end_time.isoformat() + "Z"
            period = 300

            print(
                f"Playbook Task Downstream Request: Type -> Grafana, Datasource_Uid -> {datasource_uid}, "
                f"Promql_Metric_Query -> {promql_metric_query}, Start_Time -> {start_time_str}, "
                f"End_Time -> {end_time_str}, Period -> {period}, Offset -> 0", flush=True)

            response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                            start_time_str, end_time_str, period)
            if response and 'data' in response and 'result' in response['data']:
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
                    metric_label_values.append(
                        LabelValuePair(name=StringValue(value='offset_seconds'), value=StringValue(value='0')))
                    labeled_metric_timeseries = TimeseriesResult.LabeledMetricTimeseries(
                        metric_label_values=metric_label_values, unit=StringValue(value=""),
                        datapoints=metric_datapoints)
                    labeled_metric_timeseries_list.append(labeled_metric_timeseries)

            # Get offset values if specified
            if timeseries_offsets:
                offsets = [offset.value for offset in timeseries_offsets]
                for offset in offsets:
                    offset_end_time = current_end_time - timedelta(seconds=offset)
                    offset_start_time = current_start_time - timedelta(seconds=offset)

                    offset_start_time_str = offset_start_time.isoformat() + "Z"
                    offset_end_time_str = offset_end_time.isoformat() + "Z"

                    print(
                        f"Playbook Task Downstream Request: Type -> Grafana, Datasource_Uid -> {datasource_uid}, "
                        f"Promql_Metric_Query -> {promql_metric_query}, Start_Time -> {offset_start_time_str}, "
                        f"End_Time -> {offset_end_time_str}, Period -> {period}, Offset -> {offset}", flush=True)

                    response = grafana_api_processor.fetch_promql_metric_timeseries(datasource_uid, promql_metric_query,
                                                                                    offset_start_time_str,
                                                                                    offset_end_time_str, period)
                    if response and 'data' in response and 'result' in response['data']:
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
                            metric_label_values.append(
                                LabelValuePair(name=StringValue(value='offset_seconds'),
                                               value=StringValue(value=str(offset))))
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
