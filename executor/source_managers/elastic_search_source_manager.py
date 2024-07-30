from google.protobuf.wrappers_pb2 import StringValue, UInt64Value, Int64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.elastic_search_api_processor import ElasticSearchApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.elastic_search_task_pb2 import ElasticSearch
from protos.ui_definition_pb2 import FormField, FormFieldType


class ElasticSearchSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.ELASTIC_SEARCH
        self.task_proto = ElasticSearch
        self.task_type_callable_map = {
            ElasticSearch.TaskType.QUERY_LOGS: {
                'executor': self.execute_query_logs,
                'model_types': [SourceModelType.ELASTIC_SEARCH_INDEX],
                'result_type': PlaybookTaskResultType.LOGS,
                'display_name': 'Query Logs from an ElasticSearch Index',
                'category': 'Logs',
                'form_fields': [
                    FormField(key_name=StringValue(value="index"),
                              display_name=StringValue(value="Index"),
                              description=StringValue(value='Select Index'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT),
                    FormField(key_name=StringValue(value="lucene_query"),
                              display_name=StringValue(value="Lucene Query"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                    FormField(key_name=StringValue(value="limit"),
                              display_name=StringValue(value="Enter Limit"),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=2000)),
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="offset"),
                              display_name=StringValue(value="Enter Offset"),
                              data_type=LiteralType.LONG,
                              default_value=Literal(type=LiteralType.LONG, long=Int64Value(value=0)),
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
        }

    def get_connector_processor(self, es_connector, **kwargs):
        generated_credentials = generate_credentials_dict(es_connector.type, es_connector.keys)
        return ElasticSearchApiProcessor(**generated_credentials)

    def execute_query_logs(self, time_range: TimeRange, es_task: ElasticSearch,
                           es_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not es_connector:
                raise Exception("Task execution Failed:: No ElasticSearch source found")

            query_logs = es_task.query_logs
            index = query_logs.index.value
            lucene_query = query_logs.lucene_query.value
            limit = query_logs.limit.value if query_logs.limit.value else 2000
            offset = query_logs.offset.value if query_logs.offset.value else 0
            sort_desc = query_logs.sort_desc.value if query_logs.sort_desc.value else ""
            timestamp_field = query_logs.timestamp_field.value if query_logs.timestamp_field.value else ""
            if not index:
                raise Exception("Task execution Failed:: No index found")

            lucene_query = lucene_query.strip()

            es_client = self.get_connector_processor(es_connector)

            sort = []
            if timestamp_field:
                sort.append({timestamp_field: "desc"})
            if sort_desc:
                sort.append({sort_desc: "desc"})
            sort.append({"_score": "desc"})

            if timestamp_field:
                query = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "query_string": {
                                        "query": lucene_query
                                    }
                                },
                                {
                                    "range": {
                                        timestamp_field: {
                                            "gte": time_range.time_geq * 1000,
                                            "lt": time_range.time_lt * 1000
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "size": limit,
                    "from": offset,
                    "sort": sort
                }
            else:
                query = {
                    "query": {
                        "query_string": {
                            "query": lucene_query
                        }
                    },
                    "size": limit,
                    "from": offset,
                    "sort": sort
                }

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "ElasticSearch", es_connector.account_id.value, lucene_query), flush=True)

            result = es_client.query(index, query)
            if 'hits' not in result or not result['hits']['hits']:
                raise Exception(f"No data found for the query: {lucene_query}")

            hits = result['hits']['hits']
            count_result = len(hits)
            if count_result == 0:
                raise Exception(f"No data found for the query: {query}")

            table_rows: [TableResult.TableRow] = []
            for hit in hits:
                table_columns = []
                for column, value in hit.items():
                    if column == '_source':
                        try:
                            for key, val in value.items():
                                table_column = TableResult.TableColumn(name=StringValue(value=key),
                                                                       value=StringValue(value=str(val)))
                                table_columns.append(table_column)
                        except Exception as e:
                            table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                                   value=StringValue(value=str(value)))
                            table_columns.append(table_column)
                    else:
                        table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                               value=StringValue(value=str(value)))
                        table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=StringValue(value=f"Execute ```{lucene_query}``` on index {index}"),
                                total_count=UInt64Value(value=count_result),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.LOGS, logs=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing ElasticSearch task: {e}")
