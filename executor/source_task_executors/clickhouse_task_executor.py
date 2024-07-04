from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.clickhouse_db_processor import ClickhouseDBProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2 import SqlDataFetch


class ClickhouseSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.CLICKHOUSE
        self.task_proto = SqlDataFetch
        self.task_type_callable_map = {
            SqlDataFetch.TaskType.SQL_QUERY: {
                'executor': self.execute_sql_query,
                'model_types': [SourceModelType.CLICKHOUSE_DATABASE],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query a Clickhouse Database',
                'category': 'Database'
            },
        }

    def get_connector_processor(self, clickhouse_connector, **kwargs):
        generated_credentials = generate_credentials_dict(clickhouse_connector.type, clickhouse_connector.keys)
        generated_credentials['database'] = kwargs.get('database', None)
        return ClickhouseDBProcessor(**generated_credentials)

    def execute_sql_query(self, time_range: TimeRange, global_variable_set: Dict,
                          clickhouse_task: SqlDataFetch, clickhouse_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not clickhouse_connector:
                raise Exception("Task execution Failed:: No Clickhouse source found")

            sql_query = clickhouse_task.sql_query
            order_by_column = sql_query.order_by_column.value
            limit = sql_query.limit.value
            offset = sql_query.offset.value
            query = sql_query.query.value
            query = query.strip()
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
            database = sql_query.database.value

            query_client = self.get_connector_processor(clickhouse_connector, database=database)

            count_result = query_client.get_query_result(count_query)

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "Clickhouse", clickhouse_connector.account_id.value, query), flush=True)

            result = query_client.get_query_result(query)
            columns = result.column_names
            table_rows: [TableResult.TableRow] = []
            for row in result.result_set:
                table_columns = []
                for i, column in enumerate(columns):
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(row[i])))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=sql_query.query,
                                total_count=UInt64Value(value=int(count_result.result_set[0][0])),
                                limit=UInt64Value(value=limit),
                                offset=UInt64Value(value=offset),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing Clickhouse task: {e}")
