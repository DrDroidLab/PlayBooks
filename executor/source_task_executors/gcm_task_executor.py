import json

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.gcm_api_processor import GcmApiProcessor
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.gcm_task_pb2 import Gcm


class GcmSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GCM
        self.task_proto = Gcm
        self.task_type_callable_map = {
            Gcm.TaskType.GET_METRICS: {
                'executor': self.get_metrics,
                'model_types': [SourceModelType.GCM_METRIC],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Metrics from GCM',
                'category': 'Monitoring'
            },
            Gcm.TaskType.GET_LOGS: {
                'executor': self.get_logs,
                'model_types': [SourceModelType.GCM_LOGS],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Get Logs from GCM',
                'category': 'Logging'
            },
        }

    def get_connector_processor(self, gcm_connector, **kwargs):
        generated_credentials = generate_credentials_dict(gcm_connector.type, gcm_connector.keys)
        return GcmApiProcessor(**generated_credentials)

    def get_metrics(self, gcm_task: Gcm, gcm_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gcm_connector:
                raise Exception("Task execution Failed:: No GCM source found")

            gcm_command = gcm_task.get_metrics
            metric_type = gcm_command.metricType.value
            start_time = gcm_command.startTime.value
            end_time = gcm_command.endTime.value

            gcm_connector = self.get_connector_processor(gcm_connector)
            metrics = gcm_connector.fetch_metrics(metric_type, start_time, end_time)

            table_rows = []
            for metric in metrics:
                table_columns = [
                    TableResult.TableColumn(name=StringValue(value='METRIC_TYPE'),
                                            value=StringValue(value=metric['metric']['type'])),
                    TableResult.TableColumn(name=StringValue(value='START_TIME'),
                                            value=StringValue(value=metric['points'][0]['interval']['startTime'])),
                    TableResult.TableColumn(name=StringValue(value='END_TIME'),
                                            value=StringValue(value=metric['points'][0]['interval']['endTime'])),
                    TableResult.TableColumn(name=StringValue(value='VALUE'),
                                            value=StringValue(value=str(metric['points'][0]['value']['doubleValue'])))
                ]
                table_rows.append(TableResult.TableRow(columns=table_columns))

            table = TableResult(raw_query=StringValue(value='Get Metrics'), rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except Exception as e:
            raise Exception(f"Failed to get metrics from GCM: {e}")

    def get_logs(self, gcm_task: Gcm, gcm_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not gcm_connector:
                raise Exception("Task execution Failed:: No GCM source found")

            gcm_command = gcm_task.get_logs
            filter_str = gcm_command.filter.value
            start_time = gcm_command.startTime.value
            end_time = gcm_command.endTime.value

            gcm_connector = self.get_connector_processor(gcm_connector)
            logs = gcm_connector.fetch_logs(filter_str, start_time, end_time)

            table_rows = []
            for log in logs:
                table_columns = [
                    TableResult.TableColumn(name=StringValue(value='TIMESTAMP'),
                                            value=StringValue(value=log.get('timestamp', ''))),
                    TableResult.TableColumn(name=StringValue(value='SEVERITY'),
                                            value=StringValue(value=log.get('severity', ''))),
                    TableResult.TableColumn(name=StringValue(value='TEXT_PAYLOAD'),
                                            value=StringValue(value=log.get('textPayload', ''))),
                    TableResult.TableColumn(name=StringValue(value='JSON_PAYLOAD'),
                                            value=StringValue(value=json.dumps(log.get('jsonPayload', {})))),
                    TableResult.TableColumn(name=StringValue(value='PROTO_PAYLOAD'),
                                            value=StringValue(value=json.dumps(log.get('protoPayload', {})))),
                    TableResult.TableColumn(name=StringValue(value='RESOURCE'),
                                            value=StringValue(value=json.dumps(log.get('resource', {})))),
                    TableResult.TableColumn(name=StringValue(value='LOG_NAME'),
                                            value=StringValue(value=log.get('logName', ''))),
                    TableResult.TableColumn(name=StringValue(value='RECEIVE_TIMESTAMP'),
                                            value=StringValue(value=log.get('receiveTimestamp', ''))),
                    TableResult.TableColumn(name=StringValue(value='LABELS'),
                                            value=StringValue(value=json.dumps(log.get('labels', {}))))
                ]
                table_rows.append(TableResult.TableRow(columns=table_columns))

            table = TableResult(raw_query=StringValue(value='Get Logs'), rows=table_rows,
                                total_count=UInt64Value(value=len(table_rows)))
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TABLE, table=table)
        except Exception as e:
            raise Exception(f"Failed to get logs from GCM: {e}")
