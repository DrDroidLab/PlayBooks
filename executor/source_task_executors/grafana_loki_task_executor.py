from datetime import datetime
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.grafana_loki_api_processor import GrafanaLokiApiProcessor
from protos.base_pb2 import TimeRange, Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TableResult
from protos.playbooks.source_task_definitions.grafana_loki_task_pb2 import GrafanaLoki


class GrafanaLokiSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.GRAFANA_LOKI
        self.task_proto = GrafanaLoki
        self.task_type_callable_map = {
            GrafanaLoki.TaskType.QUERY_LOGS: {
                'executor': self.execute_query_logs,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query Logs from Grafana Loki',
                'category': 'Logs'
            }
        }

    def get_connector_processor(self, grafana_loki_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_loki_connector.type, grafana_loki_connector.keys)
        return GrafanaLokiApiProcessor(**generated_credentials)

    def execute_query_logs(self, time_range: TimeRange, global_variable_set: Dict,
                           grafana_loki_task: GrafanaLoki,
                           grafana_loki_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not grafana_loki_connector:
                raise Exception("Task execution Failed:: No Grafana Loki source found")

            tr_end_time = time_range.time_lt
            tr_start_time = time_range.time_geq
            current_datetime = datetime.utcfromtimestamp(tr_end_time)
            evaluation_time = datetime.utcfromtimestamp(tr_start_time)

            start_time = evaluation_time.isoformat() + "Z"
            end_time = current_datetime.isoformat() + "Z"

            task = grafana_loki_task.query_logs
            query = task.query.value
            start = task.start_time.value if task.start_time.value else start_time
            end = task.end_time.value if task.end_time.value else end_time
            limit = task.limit.value if task.limit.value else 2000

            if global_variable_set:
                for key, value in global_variable_set.items():
                    query = query.replace(key, str(value))

            grafana_loki_api_processor = self.get_connector_processor(grafana_loki_connector)

            print(
                "Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}, Start_Time "
                "-> {}, End_Time -> {}".format("Grafana", grafana_loki_connector.account_id.value, query, start_time,
                                               end_time), flush=True)

            response = grafana_loki_api_processor.query(query, start, end, limit)
            if not response:
                raise Exception("No data returned from Grafana Loki")

            result = response.get('data', {}).get('result', [])
            table_rows: [TableResult.TableRow] = []
            for r in result:
                table_columns = []
                for key, value in r.items():
                    metadata = {}
                    if key == 'stream' or key == 'metric':
                        for k, v in value.items():
                            metadata[k] = v
                            table_columns.append(TableResult.TableColumn(name=StringValue(value=str(k)),
                                                                         value=StringValue(value=str(v))))
                    elif key == 'values':
                        for v in value:
                            for i, val in enumerate(v):
                                if i == 0:
                                    key = 'timestamp'
                                else:
                                    key = 'log'
                                table_columns.append(TableResult.TableColumn(name=StringValue(value=key),
                                                                             value=StringValue(value=str(val))))
                table_row = TableResult.TableRow(columns=table_columns)
                table_rows.append(table_row)
            table = TableResult(raw_query=StringValue(value=query), total_count=UInt64Value(value=len(result)),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing Grafana task: {e}")