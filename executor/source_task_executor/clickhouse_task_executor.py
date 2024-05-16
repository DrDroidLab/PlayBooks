from typing import Dict

import clickhouse_connect
from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.models import Connector, ConnectorKey
from executor.playbook_task_executor import PlaybookTaskExecutor
from protos.base_pb2 import Source, SourceKeyType, TimeRange
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.playbook_v2_pb2 import PlaybookTask


class ClickhouseTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.CLICKHOUSE
        self.__account_id = account_id
        try:
            clickhouse_connector = Connector.objects.get(account_id=account_id,
                                                         connector_type=Source.CLICKHOUSE,
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
            if key.key_type == SourceKeyType.CLICKHOUSE_HOST:
                self.__host = key.key
            elif key.key_type == SourceKeyType.CLICKHOUSE_PORT:
                self.__port = key.key
            elif key.key_type == SourceKeyType.CLICKHOUSE_USER:
                self.__user = key.key
            elif key.key_type == SourceKeyType.CLICKHOUSE_PASSWORD:
                self.__password = key.key
            elif key.key_type == SourceKeyType.CLICKHOUSE_INTERFACE:
                self.__interface = key.key

        if not self.__host or not self.__port or not self.__user or not self.__password:
            raise Exception("Clickhouse host, port, user or password not found for account: {}".format(account_id))

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        try:
            clickhouse_data_fetch_task = task.clickhouse_data_fetch_task
            order_by_column = clickhouse_data_fetch_task.order_by_column.value
            limit = clickhouse_data_fetch_task.limit.value
            offset = clickhouse_data_fetch_task.offset.value
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
            table_rows: [TableResult.TableRow] = []
            for row in result.result_set:
                table_columns = []
                for i, column in enumerate(columns):
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(row[i])))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=clickhouse_data_fetch_task.query,
                                total_count=UInt64Value(value=int(count_result.result_set[0][0])),
                                limit=UInt64Value(value=limit),
                                offset=UInt64Value(value=offset),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing Clickhouse task: {e}")
