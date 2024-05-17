from typing import Dict

import psycopg2
from psycopg2 import extras

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from connectors.models import Connector, ConnectorKey
from executor.playbook_task_executor import PlaybookTaskExecutor
from protos.base_pb2 import Source, SourceKeyType, TimeRange
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2 import SqlDataFetch


class PostgresTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.POSTGRES
        self.__account_id = account_id
        self.task_type_callable_map = {
            SqlDataFetch.TaskType.SQL_QUERY: self.execute_sql_query
        }

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
            if key.key_type == SourceKeyType.POSTGRES_HOST:
                self.__host = key.key
            elif key.key_type == SourceKeyType.POSTGRES_USER:
                self.__user = key.key
            elif key.key_type == SourceKeyType.POSTGRES_PASSWORD:
                self.__password = key.key

        if not self.__host or not self.__user or not self.__password:
            raise Exception("Postgres host, db, user or password not found for account: {}".format(account_id))

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        pg_task: SqlDataFetch = task.postgres
        task_type = pg_task.type
        if task_type in self.task_type_callable_map:
            try:
                return self.task_type_callable_map[task_type](time_range, global_variable_set, pg_task)
            except Exception as e:
                raise Exception(f"Error while executing Postgres task: {e}")
        else:
            raise Exception(f"Task type {task_type} not supported")

    def execute_sql_query(self, time_range: TimeRange, global_variable_set: Dict,
                          pg_task: SqlDataFetch) -> PlaybookTaskResult:
        try:
            sql_query = pg_task.sql_query
            order_by_column = sql_query.order_by_column.value
            limit = sql_query.limit.value
            offset = sql_query.offset.value
            query = sql_query.query.value
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
            database = sql_query.database.value
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

            table_rows: [TableResult.TableRow] = []
            for row in result:
                table_columns = []
                for column, value in row.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=sql_query.query,
                                total_count=UInt64Value(value=int(count_result)),
                                limit=UInt64Value(value=limit),
                                offset=UInt64Value(value=offset),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing Postgres task: {e}")
