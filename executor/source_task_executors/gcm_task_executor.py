from datetime import datetime
from typing import Dict

import pytz
from google.protobuf.wrappers_pb2 import StringValue, DoubleValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.gcm_api_processor import GcmApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import TimeseriesResult, LabelValuePair, PlaybookTaskResult, \
    PlaybookTaskResultType, TableResult
from protos.playbooks.source_task_definitions.gcm_task_pb2 import Gcm


class GcmSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GCM
        self.task_proto = Gcm
        self.task_type_callable_map = {
            Gcm.TaskType.METRIC_EXECUTION: {
                'executor': self.execute_metric_execution,
                'model_types': [SourceModelType.GCM_METRIC],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Fetch a Metric from GCM',
                'category': 'Metrics'
            },
            Gcm.TaskType.FILTER_LOG_ENTRIES: {
                'executor': self.execute_filter_log_entries,
                'model_types': [SourceModelType.GCM_LOG_SINK],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Fetch Logs from GCM',
                'category': 'Logs'
            },
        }

    def get_connector_processor(self, gcm_connector, **kwargs):
        generated_credentials = generate_credentials_dict(gcm_connector.type, gcm_connector.keys)
        generated_credentials['client_type'] = kwargs.get('client_type')
        return GcmApiProcessor(project_id=gcm_connector.account_id.value, service_account_json=generated_credentials)

    def execute_metric_execution(self, time_range: TimeRange, global_variable_set: Dict, gcm_task: Gcm,
                                 gcm_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gcm_connector:
                raise Exception("Task execution Failed:: No GCM source found")

            task_result = PlaybookTaskResult()

            tr_end_time = time_range.time_lt
            end_time = datetime.utcfromtimestamp(tr_end_time)
            tr_start_time = time_range.time_geq
            start_time = datetime.utcfromtimestamp(tr_start_time)
            period = 300

            task = gcm_task.metric_execution
            metric_type = task.metric_type.value
            project_id = task.project_id.value
            aggregation = 'ALIGN_MEAN'  # Example aggregation
            if task.aggregation and task.aggregation.value in ['ALIGN_MEAN', 'ALIGN_SUM', 'ALIGN_COUNT', 'ALIGN_MAX', 'ALIGN_MIN']:
                aggregation = task.aggregation.value
            task_labels = task.labels
            labels = [{'key': label.key.value, 'value': label.value.value} for label in task_labels]

            gcm_api_processor = self.get_connector_processor(gcm_connector, client_type='monitoring')

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Project -> {}, Metric_Type -> {}, Start_Time "
                "-> {}, End_Time -> {}, Aggregation -> {}, Labels -> {}".format(
                    "GCM_Metrics", gcm_connector.account_id.value, project_id, metric_type,
                    start_time, end_time, aggregation, labels), flush=True)

            response = gcm_api_processor.gcm_get_metric_aggregation(metric_type, start_time, end_time, aggregation, labels)
            if not response:
                raise Exception("No data returned from GCM")
            response_datapoints = response
            if len(response_datapoints) > 0:
                metric_unit = response_datapoints[0]['unit']
            else:
                metric_unit = ''
            process_function = task.process_function.value
            if process_function == 'timeseries':
                metric_datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint] = []
                for item in response_datapoints:
                    utc_timestamp = item['interval']['endTime']
                    utc_datetime = datetime.fromisoformat(utc_timestamp)
                    utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                    val = item['value']['doubleValue']
                    datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                        timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                    metric_datapoints.append(datapoint)

                labeled_metric_timeseries = [TimeseriesResult.LabeledMetricTimeseries(
                    metric_label_values=[
                        LabelValuePair(name=StringValue(value='metric_type'), value=StringValue(value=metric_type)),
                        LabelValuePair(name=StringValue(value='aggregation'),
                                       value=StringValue(value=aggregation)),
                    ],
                    unit=StringValue(value=metric_unit),
                    datapoints=metric_datapoints
                )]

                timeseries_result = TimeseriesResult(metric_name=StringValue(value=metric_type),
                                                     metric_expression=StringValue(value=project_id),
                                                     labeled_metric_timeseries=labeled_metric_timeseries)

                task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TIMESERIES, timeseries=timeseries_result,
                                                 source=self.source)

            return task_result
        except Exception as e:
            raise Exception(f"Error while executing GCM task: {e}")

    def execute_filter_log_entries(self, time_range: TimeRange, global_variable_set: Dict, gcm_task: Gcm,
                                   gcm_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gcm_connector:
                raise Exception("Task execution Failed:: No GCM source found")
            task_result = PlaybookTaskResult()
            tr_end_time = time_range.time_lt
            end_time = int(tr_end_time * 1000)
            tr_start_time = time_range.time_geq
            start_time = int(tr_start_time * 1000)

            task = gcm_task.filter_log_entries
            project_id = task.project_id.value
            log_name = task.log_name.value
            filter_query = task.filter_query.value
            if global_variable_set:
                for key, value in global_variable_set.items():
                    filter_query = filter_query.replace(key, str(value))

            logs_api_processor = self.get_connector_processor(gcm_connector, client_type='logging')

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Project -> {}, Log_Name -> {}, Query -> "
                "{}, Start_Time -> {}, End_Time -> {}".format("GCM_Logs", gcm_connector.account_id.value,
                                                              project_id, log_name, filter_query, start_time, end_time),
                flush=True)

            response = logs_api_processor.fetch_logs(filter_query, start_time, end_time)
            if not response:
                raise Exception("No data returned from GCM Logs")

            table_rows: [TableResult.TableRow] = []
            for item in response:
                table_columns: [TableResult.TableColumn] = []
                for key, value in item.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=key),
                                                           value=StringValue(value=value))
                    table_columns.append(table_column)
                table_row = TableResult.TableRow(columns=table_columns)
                table_rows.append(table_row)

            result = TableResult(
                raw_query=StringValue(value=filter_query),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)),
            )

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=result, source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing GCM task: {e}")
