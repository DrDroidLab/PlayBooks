import logging
from datetime import timedelta
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.azure_api_processor import AzureApiProcessor

from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TableResult
from protos.playbooks.source_task_definitions.azure_task_pb2 import Azure

logger = logging.getLogger(__name__)


class AzureSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.AZURE
        self.task_proto = Azure
        self.task_type_callable_map = {
            Azure.TaskType.FILTER_LOG_EVENTS: {
                'task_type': 'FILTER_LOG_EVENTS',
                'executor': self.filter_log_events,
                'model_types': [SourceModelType.AZURE_WORKSPACE],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Fetch logs from Azure Log Analytics Workspace',
                'category': 'Logs'
            },
        }

    def get_connector_processor(self, azure_connector, **kwargs):
        generated_credentials = generate_credentials_dict(azure_connector.type, azure_connector.keys)
        return AzureApiProcessor(**generated_credentials)

    def filter_log_events(self, time_range: TimeRange, global_variable_set: Dict,
                          azure_task: Azure, azure_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            tr_end_time = time_range.time_lt
            end_time = int(tr_end_time * 1000)
            tr_start_time = time_range.time_geq
            start_time = int(tr_start_time * 1000)

            task: Azure.FilterLogEvents = azure_task.filter_log_events
            workspace_id = task.workspace_id.value
            timespan_delta = task.timespan.value
            timespan = timedelta(hours=int(timespan_delta)) if timespan_delta else timedelta(
                seconds=end_time - start_time)
            query_pattern = task.filter_query.value
            for key, value in global_variable_set.items():
                query_pattern = query_pattern.replace(key, str(value))

            azure_api_processor = self.get_connector_processor(azure_connector)

            logger.info(f"Querying Azure Log Analytics workspace: {workspace_id} with query: {query_pattern}")

            response = azure_api_processor.query_log_analytics(workspace_id, query_pattern, timespan=timespan)
            if not response:
                raise Exception("No data returned from Azure Analytics workspace Logs")

            print(f"Response: {response}")
            table_rows: [TableResult.TableRow] = []
            for table, rows in response.items():
                for i in rows:
                    table_columns: [TableResult.TableRow.TableColumn] = []
                    for key, value in i.items():
                        table_column_name = f'{table}.{key}'
                        table_column = TableResult.TableColumn(
                            name=StringValue(value=table_column_name), value=StringValue(value=str(value)))
                        table_columns.append(table_column)
                    table_row = TableResult.TableRow(columns=table_columns)
                    table_rows.append(table_row)

            result = TableResult(
                raw_query=StringValue(value=query_pattern),
                rows=table_rows,
                total_count=UInt64Value(value=len(table_rows)),
            )

            task_result = PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=result, source=self.source)
            return task_result
        except Exception as e:
            raise Exception(f"Error while executing Azure task: {e}")
