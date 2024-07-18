import logging
from datetime import datetime, timezone
from typing import Dict
import re
import json

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

logger = logging.getLogger(__name__)


def get_project_id(gcm_connector: ConnectorProto) -> str:
    project_id = next(
        (key.key.value for key in gcm_connector.keys if key.display_name.value.lower() == "project id"), '')

    if not project_id:
        service_account_json = next((key.key.value for key in gcm_connector.keys if
                                     key.display_name.value.lower() == "service account json"), '')
        if service_account_json:
            try:
                import json
                service_account_info = json.loads(service_account_json)
                project_id = service_account_info.get('project_id', '')
            except json.JSONDecodeError:
                logger.error("Error: Unable to parse service account JSON")
        else:
            logger.error("Error: Service Account JSON not found in connector keys")

    if not project_id:
        raise Exception("Unable to extract project ID from GCM connector")

    return project_id


class GcmSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GCM
        self.task_proto = Gcm
        self.task_type_callable_map = {
            Gcm.TaskType.RUN_MQL_QUERY: {
                'executor': self.execute_run_mql_query,
                'model_types': [SourceModelType.GCM_METRIC],
                'result_type': PlaybookTaskResultType.TIMESERIES,
                'display_name': 'Run MQL Query on GCM',
                'category': 'Metrics'
            },
            Gcm.TaskType.FILTER_LOG_ENTRIES: {
                'executor': self.execute_filter_log_entries,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Fetch Logs from GCM',
                'category': 'Logs'
            },
        }

    def get_connector_processor(self, gcm_connector, **kwargs):
        generated_credentials = generate_credentials_dict(gcm_connector.type, gcm_connector.keys)
        return GcmApiProcessor(**generated_credentials)

    def execute_run_mql_query(self, time_range: TimeRange, global_variable_set: Dict, gcm_task: Gcm,
                              gcm_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gcm_connector:
                raise Exception("Task execution Failed:: No GCM source found")

            task_result = PlaybookTaskResult()

            tr_end_time = time_range.time_lt
            end_time = datetime.utcfromtimestamp(tr_end_time).strftime("d'%Y/%m/%d %H:%M'")
            tr_start_time = time_range.time_geq
            start_time = datetime.utcfromtimestamp(tr_start_time).strftime("d'%Y/%m/%d %H:%M'")

            task = gcm_task.run_mql_query
            project_id = get_project_id(gcm_connector)
            query = task.query.value.strip()

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Project -> {}, Query -> {}, Start_Time "
                "-> {}, End_Time -> {}".format(
                    "RUN_MQL_QUERY", gcm_connector.account_id.value, project_id, query,
                    start_time, end_time), flush=True)

            if "| within " in query:
                query = query.split("| within ")[0].strip()

            query_with_time = f"""
            {query} | within {start_time}, {end_time}
            """

            gcm_api_processor = self.get_connector_processor(gcm_connector, client_type='monitoring')
            response = gcm_api_processor.run_mql_query(query_with_time, project_id)

            if not response:
                raise Exception("No data returned from GCM")

            metric_datapoints = []
            for item in response:
                for point in item['pointData']:
                    utc_timestamp = point['timeInterval']['endTime'].rstrip('Z')
                    utc_datetime = datetime.fromisoformat(utc_timestamp)
                    utc_datetime = utc_datetime.replace(tzinfo=pytz.UTC)
                    val = point['values'][0]['doubleValue']
                    datapoint = TimeseriesResult.LabeledMetricTimeseries.Datapoint(
                        timestamp=int(utc_datetime.timestamp() * 1000), value=DoubleValue(value=val))
                    metric_datapoints.append(datapoint)

            labeled_metric_timeseries = [TimeseriesResult.LabeledMetricTimeseries(
                metric_label_values=[
                    LabelValuePair(name=StringValue(value='query'), value=StringValue(value=query))
                ],
                datapoints=metric_datapoints
            )]

            timeseries_result = TimeseriesResult(metric_name=StringValue(value=query),
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

            task = gcm_task.filter_log_entries
            project_id = get_project_id(gcm_connector)
            filter_query = str(task.filter_query.value)
            if global_variable_set:
                for key, value in global_variable_set.items():
                    filter_query = filter_query.replace(key, str(value))

            timestamp_match = re.search(r'timestamp\s*>=\s*"([^"]+)"', filter_query)
            if timestamp_match:
                start_time = datetime.strptime(timestamp_match.group(1), "%Y-%m-%dT%H:%M:%S.%fZ").replace(
                    tzinfo=timezone.utc)
                filter_query = re.sub(r'timestamp\s*>=\s*"[^"]+"', '', filter_query).strip()
            else:
                start_time = datetime.utcfromtimestamp(time_range.time_geq).replace(tzinfo=timezone.utc)

            end_time = datetime.utcfromtimestamp(time_range.time_lt).replace(tzinfo=timezone.utc)

            time_filter = f'timestamp >= "{start_time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")}" AND timestamp <= "{end_time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")}"'
            if filter_query:
                filter_query = f'({filter_query}) AND {time_filter}'
            else:
                filter_query = time_filter

            logs_api_processor = self.get_connector_processor(gcm_connector, client_type='logging')

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Project -> {}, Query -> "
                "{}, Start_Time -> {}, End_Time -> {}".format("GCM_Logs", gcm_connector.account_id.value,
                                                              project_id, filter_query, start_time, end_time))

            response = logs_api_processor.fetch_logs(filter_query)
            if not response:
                logger.error("No data returned from GCM Logs")
                raise Exception("No data returned from GCM Logs")

            table_rows = []
            for item in response:
                json_payload = item.get('jsonPayload', {})
                message = json_payload.get('message', '')
                if message == "failed to acquire lease gke-managed-filestorecsi/filestore-csi-storage-gke-io-node":
                    logger.error("Error: Failed to acquire lease for GKE-managed Filestore CSI.")
                    continue
                table_columns = []
                for key, value in item.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=key),
                                                           value=StringValue(value=str(value)))
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
            logger.error(f"Error while executing GCM task: {e}")
            raise Exception(f"Error while executing GCM task: {e}")


