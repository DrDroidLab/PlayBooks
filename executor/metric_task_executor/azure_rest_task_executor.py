import logging
from datetime import datetime
from typing import Dict

import pytz
from google.protobuf.wrappers_pb2 import StringValue, DoubleValue

from connectors.models import Connector, ConnectorKey
from executor.metric_task_executor.playbook_metric_task_executor import PlaybookMetricTaskExecutor
from integrations_api_processors.azure_rest_api_processor import AzureRestApiProcessorProcessor
from protos.base_pb2 import TimeRange
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookAzureTask as PlaybookAzureTaskProto, PlaybookMetricTaskExecutionResult

logger = logging.getLogger(__name__)


class AzureMetricTaskExecutor(PlaybookMetricTaskExecutor):

    def __init__(self, account_id):
        self.source = PlaybookMetricTaskDefinitionProto.Source.AZURE
        self.task_type_callable_map = {
            PlaybookAzureTaskProto.TaskType.FILTER_LOG_EVENTS: self.execute_filter_log_events_task
        }

        self.__account_id = account_id

        try:
            azure_connector = Connector.objects.get(account_id=account_id,
                                                    connector_type=ConnectorTypeProto.AZURE,
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
            if key.key_type == ConnectorKeyProto.KeyType.AZURE_CLIENT_ID:
                self.__azure_client_id = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.AZURE_CLIENT_SECRET:
                self.__azure_client_secret = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.AZURE_TENANT_ID:
                self.__azure_tenant_id = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.AZURE_SUBSCRIPTION_ID:
                self.__azure_subscription_id = key.key

        if not self.__azure_client_id or not self.__azure_client_secret or not self.__azure_tenant_id or \
                not self.__azure_subscription_id:
            raise Exception("Azure credentials not found")

    def execute(self, time_range: TimeRange, global_variable_set: Dict,
                task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
        azure_task = task.azure_task
        task_type = azure_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, azure_task)
            except Exception as e:
                raise Exception(f"Error while executing Azure task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_filter_log_events_task(self, time_range: TimeRange, global_variable_set: Dict,
                                       azure_task: PlaybookAzureTaskProto) -> PlaybookMetricTaskExecutionResult:
        tr_end_time = time_range.time_lt
        end_time = int(tr_end_time * 1000)
        tr_start_time = time_range.time_geq
        start_time = int(tr_start_time * 1000)

        task = azure_task.filter_log_events_task
        workspace_id = task.workspace_id.value
        timespan = task.timespan.value
        query_pattern = task.filter_query.value
        for key, value in global_variable_set.items():
            query_pattern = query_pattern.replace(key, str(value))

        azure_rest_api_processor = AzureRestApiProcessorProcessor(self.__azure_subscription_id, self.__azure_client_id,
                                                                  self.__azure_client_secret, self.__azure_tenant_id)

        logger.info(f"Querying Azure Log Analytics workspace: {workspace_id} with query: {query_pattern}")

        response = azure_rest_api_processor.query_log_analytics(workspace_id, query_pattern)
        if not response:
            raise Exception("No data returned from Cloudwatch Logs")

        table_rows: [PlaybookMetricTaskExecutionResult.Result.TableResult.TableRow] = []
        print(response)
        # for item in response:
        #     table_columns: [PlaybookMetricTaskExecutionResult.Result.TableResult.TableRow.TableColumn] = []
        #     for i in item:
        #         table_column = PlaybookMetricTaskExecutionResult.Result.TableResult.TableColumn(
        #             name=StringValue(value=i['field']), value=StringValue(value=i['value']))
        #         table_columns.append(table_column)
        #     table_row = PlaybookMetricTaskExecutionResult.Result.TableResult.TableRow(columns=table_columns)
        #     table_rows.append(table_row)
        #
        # result = PlaybookMetricTaskExecutionResult.Result(
        #     type=PlaybookMetricTaskExecutionResult.Result.Type.TABLE_RESULT,
        #     table_result=PlaybookMetricTaskExecutionResult.Result.TableResult(rows=table_rows))

        task_execution_result = PlaybookMetricTaskExecutionResult(
            metric_source=PlaybookMetricTaskDefinitionProto.Source.AZURE,
            metric_expression=StringValue(value=query_pattern),
            metric_name=StringValue(value='log_analytics_events'))

        return task_execution_result
