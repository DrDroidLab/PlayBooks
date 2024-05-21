import logging
from datetime import timedelta
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.models import Connector, ConnectorKey

from executor.playbook_task_executor import PlaybookTaskExecutor
from integrations_api_processors.azure_api_processor import AzureApiProcessor
from protos.base_pb2 import TimeRange, Source, SourceKeyType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TableResult
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.azure_task_pb2 import Azure

logger = logging.getLogger(__name__)


class AzureTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.AZURE
        self.task_type_callable_map = {
            Azure.TaskType.FILTER_LOG_EVENTS: self.filter_log_events
        }

        self.__account_id = account_id

        try:
            azure_connector = Connector.objects.get(account_id=account_id,
                                                    connector_type=Source.AZURE,
                                                    is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Azure connector not found")
        if not azure_connector:
            raise Exception("Azure connector not found")

        azure_connector_key = ConnectorKey.objects.filter(connector_id=azure_connector.id,
                                                          account_id=account_id,
                                                          is_active=True)
        if not azure_connector_key:
            raise Exception("Azure connector key not found")

        for key in azure_connector_key:
            if key.key_type == SourceKeyType.AZURE_CLIENT_ID:
                self.__azure_client_id = key.key
            elif key.key_type == SourceKeyType.AZURE_CLIENT_SECRET:
                self.__azure_client_secret = key.key
            elif key.key_type == SourceKeyType.AZURE_TENANT_ID:
                self.__azure_tenant_id = key.key
            elif key.key_type == SourceKeyType.AZURE_SUBSCRIPTION_ID:
                self.__azure_subscription_id = key.key

        if not self.__azure_client_id or not self.__azure_client_secret or not self.__azure_tenant_id or \
                not self.__azure_subscription_id:
            raise Exception("Azure credentials not found")

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        try:
            azure_task: Azure = task.azure
            task_type = azure_task.type
            if task_type in self.task_type_callable_map:
                try:
                    return self.task_type_callable_map[task_type](time_range, global_variable_set, azure_task)
                except Exception as e:
                    raise Exception(f"Error while executing Azure task: {e}")
            else:
                raise Exception(f"Task type {task_type} not supported")
        except Exception as e:
            raise Exception(f"Error while executing Azure task: {e}")

    def filter_log_events(self, time_range: TimeRange, global_variable_set: Dict,
                          azure_task: Azure) -> PlaybookTaskResult:
        tr_end_time = time_range.time_lt
        end_time = int(tr_end_time * 1000)
        tr_start_time = time_range.time_geq
        start_time = int(tr_start_time * 1000)

        task: Azure.FilterLogEvents = azure_task.filter_log_events
        workspace_id = task.workspace_id.value
        timespan_delta = task.timespan.value
        timespan = timedelta(seconds=int(timespan_delta)) if timespan_delta else timedelta(
            seconds=end_time - start_time)
        query_pattern = task.filter_query.value
        for key, value in global_variable_set.items():
            query_pattern = query_pattern.replace(key, str(value))

        azure_api_processor = AzureApiProcessor(self.__azure_subscription_id, self.__azure_tenant_id,
                                                self.__azure_client_id, self.__azure_client_secret)

        logger.info(f"Querying Azure Log Analytics workspace: {workspace_id} with query: {query_pattern}")

        response = azure_api_processor.query_log_analytics(workspace_id, query_pattern, timespan=timespan)
        if not response:
            raise Exception("No data returned from Azure Analytics workspace Logs")

        table_rows: [TableResult.TableRow] = []
        for table, rows in response.items():
            table_columns: [TableResult.TableRow.TableColumn] = []
            for i in rows:
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
