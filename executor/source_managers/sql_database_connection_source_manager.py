import threading

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, Int64Value
from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.db_connection_string_processor import DBConnectionStringProcessor
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2 import SqlDataFetch
from protos.ui_definition_pb2 import FormField, FormFieldType


class TimeoutException(Exception):
    pass


class SqlDatabaseConnectionSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.SQL_DATABASE_CONNECTION
        self.task_proto = SqlDataFetch
        self.task_type_callable_map = {
            SqlDataFetch.TaskType.SQL_QUERY: {
                'executor': self.execute_sql_query,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query any SQL Database',
                'category': 'Database',
                'form_fields': [
                    FormField(key_name=StringValue(value="query"),
                              display_name=StringValue(value="Query"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                    FormField(key_name=StringValue(value="timeout"),
                              display_name=StringValue(value="Timeout (in seconds)"),
                              description=StringValue(value='Enter Timeout (in seconds)'),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=120)),
                              form_field_type=FormFieldType.TEXT_FT)
                ]
            },
        }

    def get_connector_processor(self, sql_database_connector, **kwargs):
        generated_credentials = generate_credentials_dict(sql_database_connector.type, sql_database_connector.keys)
        return DBConnectionStringProcessor(**generated_credentials)

    def execute_sql_query(self, time_range: TimeRange, sql_data_fetch_task: SqlDataFetch,
                          sql_db_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not sql_db_connector:
                raise Exception("Task execution Failed:: No SQL Database source found")

            sql_query = sql_data_fetch_task.sql_query
            order_by_column = sql_query.order_by_column.value
            limit = sql_query.limit.value
            offset = sql_query.offset.value
            query = sql_query.query.value
            query = query.strip()
            database = sql_query.database.value
            timeout = sql_query.timeout.value if sql_query.timeout.value else 120

            if query[-1] == ';':
                query = query[:-1]

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
                nonlocal count_result, query_result, exception
                try:
                    sql_db_processor = self.get_connector_processor(sql_db_connector)
                    count_result = sql_db_processor.get_query_result(count_query, timeout=timeout).fetchone()[0]
                    query_result = sql_db_processor.get_query_result(query, timeout=timeout)
                except Exception as e:
                    exception = e

            count_result = None
            query_result = None
            exception = None

            query_thread = threading.Thread(target=query_db)
            query_thread.start()
            query_thread.join(timeout)

            if query_thread.is_alive():
                raise TimeoutException(f"Function 'execute_sql_query' exceeded the timeout of {timeout} seconds")

            if exception:
                raise exception

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "SQL Database", sql_db_connector.account_id.value, query), flush=True)

            table_rows: [TableResult.TableRow] = []
            col_names = list(query_result.keys())
            query_result = query_result.fetchall()
            for row in query_result:
                table_columns = []
                for i, value in enumerate(row):
                    table_column = TableResult.TableColumn(name=StringValue(value=col_names[i]),
                                                           value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=StringValue(value=f'Execute {query} on {database}'),
                                total_count=UInt64Value(value=int(count_result)),
                                limit=UInt64Value(value=limit),
                                offset=UInt64Value(value=offset),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except TimeoutException as te:
            raise Exception(f"Timeout error while executing Sql Database task: {te}")
        except Exception as e:
            raise Exception(f"Error while executing Sql Database task: {e}")
