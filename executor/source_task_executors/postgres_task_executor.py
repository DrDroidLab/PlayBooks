from typing import Dict
import threading

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, Int64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.postgres_db_processor import PostgresDBProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType, SourceKeyType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2 import SqlDataFetch
from protos.ui_definition_pb2 import FormField


class TimeoutException(Exception):
    pass


class PostgresSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.POSTGRES
        self.task_proto = SqlDataFetch
        self.task_type_callable_map = {
            SqlDataFetch.TaskType.SQL_QUERY: {
                'executor': self.execute_sql_query,
                'model_types': [SourceModelType.POSTGRES_QUERY],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query a Postgres Database',
                'category': 'Database',
                'form_fields': [
                    FormField(key_name=StringValue(value="database"),
                              display_name=StringValue(value="Database"),
                              description=StringValue(value='Enter Database'),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="query"),
                              display_name=StringValue(value="Query"),
                              data_type=LiteralType.STRING),
                    FormField(key_name=StringValue(value="timeout"),
                              display_name=StringValue(value="Timeout (in seconds)"),
                              description=StringValue(value='Enter Timeout (in seconds)'),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=120)))
                ]
            },
        }

    def get_connector_processor(self, pg_connector, **kwargs):
        generated_credentials = generate_credentials_dict(pg_connector.type, pg_connector.keys)
        if kwargs and 'database' in kwargs:
            generated_credentials['database'] = kwargs['database']
        return PostgresDBProcessor(**generated_credentials)

    def execute_sql_query(self, time_range: TimeRange, global_variable_set: Dict, pg_task: SqlDataFetch,
                          pg_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not pg_connector:
                raise Exception("Task execution Failed:: No Postgres source found")

            sql_query = pg_task.sql_query
            order_by_column = sql_query.order_by_column.value
            limit = sql_query.limit.value
            offset = sql_query.offset.value
            query = sql_query.query.value
            query = query.strip()
            database = sql_query.database.value
            timeout = sql_query.timeout.value if sql_query.timeout.value else 120

            if not database:
                pg_keys = pg_connector.keys
                for key in pg_keys:
                    if key.key_type == SourceKeyType.POSTGRES_DATABASE:
                        database = key.key.value
                        break
            if not database:
                raise Exception("Task execution Failed:: No Postgres database found")

            if query[-1] == ';':
                query = query[:-1]

            if global_variable_set:
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

            def query_db():
                nonlocal count_result, result, exception
                try:
                    pg_db_processor = self.get_connector_processor(pg_connector, database=database)
                    count_result = pg_db_processor.get_query_result_fetch_one(count_query, timeout=timeout)
                    result = pg_db_processor.get_query_result(query, timeout=timeout)
                except Exception as e:
                    exception = e

            count_result = None
            result = None
            exception = None

            query_thread = threading.Thread(target=query_db)
            query_thread.start()
            query_thread.join(timeout)

            if query_thread.is_alive():
                raise TimeoutException(f"Function 'execute_sql_query' exceeded the timeout of {timeout} seconds")

            if exception:
                raise exception

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "Postgres", pg_connector.account_id.value, query), flush=True)

            table_rows: [TableResult.TableRow] = []
            for row in result:
                table_columns = []
                for column, value in row.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=StringValue(value=f'Execute {query} on {database}'),
                                total_count=UInt64Value(value=int(count_result)),
                                limit=UInt64Value(value=limit),
                                offset=UInt64Value(value=offset),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing Postgres task: {e}")
