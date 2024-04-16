from typing import Dict

import clickhouse_connect
from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.models import Connector, ConnectorKey
from executor.data_fetch_task_executor.data_fetch_task_executor import PlaybookDataFetchTaskExecutor
from protos.connectors.connector_pb2 import ConnectorType as ConnectorTypeProto, ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookDataFetchTaskDefinition as PlaybookDataFetchTaskDefinitionProto, \
    PlaybookDataFetchTaskExecutionResult as PlaybookDataFetchTaskExecutionResultProto


class ClickhouseDataFetchTaskExecutor(PlaybookDataFetchTaskExecutor):

    def __init__(self, account_id):
        self.source = PlaybookDataFetchTaskDefinitionProto.Source.CLICKHOUSE

        self.__account_id = account_id

        try:
            clickhouse_connector = Connector.objects.get(account_id=account_id,
                                                         connector_type=ConnectorTypeProto.CLICKHOUSE,
                                                         is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Clickhouse connector not found for account: {}".format(account_id))
        if not clickhouse_connector:
            raise Exception("Active Clickhouse connector not found for account: {}".format(account_id))

        clickhouse_connector_keys = ConnectorKey.objects.filter(connector_id=clickhouse_connector.id,
                                                                account_id=account_id,
                                                                is_active=True)
        if not clickhouse_connector_keys:
            raise Exception("Active Clickhouse connector keys not found for account: {}".format(account_id))

        for key in clickhouse_connector_keys:
            if key.key_type == ConnectorKeyProto.KeyType.CLICKHOUSE_HOST:
                self.__host = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.CLICKHOUSE_PORT:
                self.__port = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.CLICKHOUSE_USER:
                self.__user = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.CLICKHOUSE_PASSWORD:
                self.__password = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.CLICKHOUSE_INTERFACE:
                self.__interface = key.key

        if not self.__host or not self.__port or not self.__user or not self.__password:
            raise Exception("Clickhouse host, port, user or password not found for account: {}".format(account_id))

    def execute(self, global_variable_set: Dict,
                task: PlaybookDataFetchTaskDefinitionProto) -> PlaybookDataFetchTaskExecutionResultProto:
        try:
            order_by_column = task.order_by_column.value
            limit = task.limit.value
            offset = task.offset.value
            clickhouse_data_fetch_task = task.clickhouse_data_fetch_task
            query = clickhouse_data_fetch_task.query.value
            query = query.strip()
            if query[-1] == ';':
                query = query[:-1]
            for key, value in global_variable_set.items():
                query = query.replace(key, str(value))
            count_query = f"SELECT COUNT(*) FROM ({query}) AS subquery"
            if order_by_column and 'order by' not in query.lower():
                query = f"{query} ORDER BY {order_by_column} DESC"
            if limit and offset and 'limit' not in query.lower():
                query = f"{query} LIMIT {limit} OFFSET {offset}"
            if not limit and 'limit' not in query.lower():
                limit = 10
                offset = 0
                query = f"{query} LIMIT 2000 OFFSET 0"
            database = clickhouse_data_fetch_task.database.value
            config = {
                'interface': self.__interface,
                'host': self.__host,
                'port': int(self.__port),
                'user': self.__user,
                'password': self.__password,
                'database': database
            }
            query_client = clickhouse_connect.get_client(**config)
            count_result = query_client.query(count_query)

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "Clickhouse", self.__account_id, query
            ), flush=True)

            result = query_client.query(query)
            columns = result.column_names
            table_rows: [PlaybookDataFetchTaskExecutionResultProto.Result.TableResult.TableRow] = []
            for row in result.result_set:
                table_columns = []
                for i, column in enumerate(columns):
                    table_column = PlaybookDataFetchTaskExecutionResultProto.Result.TableResult.TableColumn(
                        name=StringValue(value=column),
                        value=StringValue(value=str(row[i]))
                    )
                    table_columns.append(table_column)
                table_rows.append(
                    PlaybookDataFetchTaskExecutionResultProto.Result.TableResult.TableRow(columns=table_columns))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=task.source,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=PlaybookDataFetchTaskExecutionResultProto.Result.TableResult(
                                                                     raw_query=clickhouse_data_fetch_task.query,
                                                                     total_count=UInt64Value(
                                                                         value=int(count_result.result_set[0][0])),
                                                                     limit=UInt64Value(value=limit),
                                                                     offset=UInt64Value(value=offset),
                                                                     rows=table_rows))
                                                             )
        except Exception as e:
            raise Exception(f"Error while executing Clickhouse task: {e}")
