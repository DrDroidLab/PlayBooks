from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value
from connectors.models import Connector, ConnectorKey
from executor.data_fetch_task_executor.data_fetch_task_executor import PlaybookDataFetchTaskExecutor
from integrations_api_processors.db_connection_string_processor import DBConnectionStringProcessor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import ConnectorKey as ConnectorKeyProto
from protos.playbooks.playbook_pb2 import PlaybookDataFetchTaskDefinition as PlaybookDataFetchTaskDefinitionProto, \
    PlaybookDataFetchTaskExecutionResult as PlaybookDataFetchTaskExecutionResultProto, TableResult as TableResultProto


class SqlDatabaseDataFetchTaskExecutor(PlaybookDataFetchTaskExecutor):

    def __init__(self, account_id):
        self.source = C.SQL_DATABASE_CONNECTION

        self.__account_id = account_id

        try:
            sql_database_connector = Connector.objects.get(account_id=account_id,
                                                           connector_type=Source.SQL_DATABASE_CONNECTION,
                                                           is_active=True)
        except Connector.DoesNotExist:
            raise Exception("Active SQL Database connector not found for account: {}".format(account_id))
        if not sql_database_connector:
            raise Exception("Active SQL Database connector not found for account: {}".format(account_id))

        sql_database_connector_keys = ConnectorKey.objects.filter(connector_id=sql_database_connector.id,
                                                                  account_id=account_id,
                                                                  is_active=True)
        if not sql_database_connector_keys:
            raise Exception("Active SQL Database connector keys not found for account: {}".format(account_id))

        for key in sql_database_connector_keys:
            if key.key_type == ConnectorKeyProto.KeyType.SQL_DATABASE_CONNECTION_STRING_URI:
                self.__connection_string = key.key

        if not self.__connection_string:
            raise Exception("SQL Database connection string not found for account: {}".format(account_id))

        try:
            self.client = DBConnectionStringProcessor(self.__connection_string)
            self.client.test_connection()
        except Exception as e:
            raise Exception(f"Error while connecting to SQL Database: {e}")

    def execute(self, global_variable_set: Dict,
                task: PlaybookDataFetchTaskDefinitionProto) -> PlaybookDataFetchTaskExecutionResultProto:
        try:
            order_by_column = task.order_by_column.value
            limit = task.limit.value
            offset = task.offset.value
            sql_database_connection_data_fetch_task = task.sql_database_connection_data_fetch_task
            query = sql_database_connection_data_fetch_task.query.value
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

            count_result = self.client.get_query_result(count_query).fetchone()[0]

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "SQL Database", self.__account_id, query), flush=True)

            query_result = self.client.get_query_result(query).fetchall()

            table_rows: [TableResultProto.TableRow] = []
            col_names = list(self.client.get_query_result(query).keys())
            for row in query_result:
                table_columns = []
                for i, value in enumerate(row):
                    table_column = TableResultProto.TableColumn(name=StringValue(value=col_names[i]),
                                                                value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResultProto.TableRow(columns=table_columns))
            return PlaybookDataFetchTaskExecutionResultProto(data_source=task.source,
                                                             result=PlaybookDataFetchTaskExecutionResultProto.Result(
                                                                 type=PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT,
                                                                 table_result=TableResultProto(
                                                                     raw_query=sql_database_connection_data_fetch_task.query,
                                                                     total_count=UInt64Value(value=int(count_result)),
                                                                     limit=UInt64Value(value=limit),
                                                                     offset=UInt64Value(value=offset),
                                                                     rows=table_rows))
                                                             )
        except Exception as e:
            raise Exception(f"Error while executing Sql Database task: {e}")
