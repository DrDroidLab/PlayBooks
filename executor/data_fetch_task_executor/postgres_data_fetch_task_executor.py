from typing import Dict

import psycopg2
from psycopg2 import extras

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from connectors.models import Connector, ConnectorKey
from executor.data_fetch_task_executor.data_fetch_task_executor import PlaybookDataFetchTaskExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookDataFetchTaskDefinition as PlaybookDataFetchTaskDefinitionProto, \
    PlaybookDataFetchTaskExecutionResult as PlaybookDataFetchTaskExecutionResultProto, TableResult as TableResultProto


class PostgresDataFetchTaskExecutor(PlaybookDataFetchTaskExecutor):

    def __init__(self, account_id):
        self.source = PlaybookDataFetchTaskDefinitionProto.Source.POSTGRES

        self.__account_id = account_id

        try:
            postgres_connector = Connector.objects.get(account_id=account_id,
                                                       connector_type=Source.POSTGRES,
                                                       is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active Postgres connector not found for account: {}".format(account_id))
        if not postgres_connector:
            raise Exception("Active Postgres connector not found for account: {}".format(account_id))

        postgres_connector_keys = ConnectorKey.objects.filter(connector_id=postgres_connector.id,
                                                              account_id=account_id,
                                                              is_active=True)
        if not postgres_connector_keys:
            raise Exception("Active Postgres connector keys not found for account: {}".format(account_id))

        for key in postgres_connector_keys:
            if key.key_type == ConnectorKeyProto.KeyType.POSTGRES_HOST:
                self.__host = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.POSTGRES_USER:
                self.__user = key.key
            elif key.key_type == ConnectorKeyProto.KeyType.POSTGRES_PASSWORD:
                self.__password = key.key

        if not self.__host or not self.__user or not self.__password:
            raise Exception("Postgres host, db, user or password not found for account: {}".format(account_id))

    def execute(self, global_variable_set: Dict,
                task: PlaybookDataFetchTaskDefinitionProto) -> PlaybookDataFetchTaskExecutionResultProto:
        try:
            order_by_column = task.order_by_column.value
            limit = task.limit.value
            offset = task.offset.value
            postgres_data_fetch_task = task.postgres_data_fetch_task
            query = postgres_data_fetch_task.query.value
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
            database = postgres_data_fetch_task.database.value
            config = {
                'host': self.__host,
                'user': self.__user,
                'password': self.__password,
                'database': database
            }

            query_client = psycopg2.connect(**config)
            cursor = query_client.cursor(cursor_factory=extras.DictCursor)
            cursor.execute(count_query)
            count_result = cursor.fetchone()[0]

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "Postgres", self.__account_id, query
            ), flush=True)

            cursor.execute(query)
            result = cursor.fetchall()
            cursor.close()
            query_client.close()

            table_rows: [TableResultProto.TableRow] = []
            for row in result:
                table_columns = []
                for column, value in row.items():
                    table_column = TableResultProto.TableColumn(name=StringValue(value=column),
                                                                value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResultProto.TableRow(columns=table_columns))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=task.source,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=postgres_data_fetch_task.query,
                                                                     total_count=UInt64Value(value=int(count_result)),
                                                                     limit=UInt64Value(value=limit),
                                                                     offset=UInt64Value(value=offset),
                                                                     rows=table_rows))
                                                             )
        except Exception as e:
            raise Exception(f"Error while executing Postgres task: {e}")
