from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, Int64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.bigquery_api_processor import BigQueryApiProcessor
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.big_query_task_pb2 import BigQuery
from protos.ui_definition_pb2 import FormField, FormFieldType


class BigQuerySourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.BIG_QUERY
        self.task_proto = BigQuery
        self.task_type_callable_map = {
            BigQuery.TaskType.QUERY_TABLE: {
                'executor': self.execute_query_table,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query Table from a BigQuery Dataset',
                'category': 'Tables',
                'form_fields': [
                    FormField(key_name=StringValue(value="dataset"),
                              display_name=StringValue(value="Dataset"),
                              description=StringValue(value='Select Dataset'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="table"),
                              display_name=StringValue(value="Table"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="query"),
                              display_name=StringValue(value="SQL Query"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                    FormField(key_name=StringValue(value="limit"),
                              display_name=StringValue(value="Enter Limit"),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=1000)),
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
        }

    def get_connector_processor(self, bq_connector, **kwargs):
        generated_credentials = generate_credentials_dict(bq_connector.type, bq_connector.keys)
        return BigQueryApiProcessor(**generated_credentials)

    def execute_query_table(self, time_range: TimeRange, bq_task: BigQuery,
                            bq_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not bq_connector:
                raise Exception("Task execution Failed:: No BigQuery source found")

            query_table = bq_task.query_table
            dataset = query_table.dataset.value
            table = query_table.table.value
            query = query_table.query.value
            limit = query_table.limit.value if query_table.limit.value else 1000

            if not dataset or not table:
                raise Exception("Task execution Failed:: No dataset or table found")

            query = query.strip()

            bq_client = self.get_connector_processor(bq_connector)

            full_query = f"SELECT * FROM `{dataset}.{table}` WHERE {query} LIMIT {limit}"

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "BigQuery", bq_connector.account_id.value, full_query), flush=True)

            result = bq_client.query(full_query)
            if 'rows' not in result or not result['rows']:
                raise Exception(f"No data found for the query: {query}")

            rows = result['rows']
            count_result = len(rows)
            if count_result == 0:
                raise Exception(f"No data found for the query: {query}")

            table_rows: [TableResult.TableRow] = []
            for row in rows:
                table_columns = []
                for column, value in row.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table_result = TableResult(raw_query=StringValue(value=f"Execute ```{query}``` on table {table}"),
                                       total_count=UInt64Value(value=count_result),
                                       rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table_result, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing BigQuery task: {e}")
