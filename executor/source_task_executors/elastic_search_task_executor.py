import json
from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue, UInt64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.elastic_search_api_processor import ElasticSearchApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, TableResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.elastic_search_task_pb2 import ElasticSearch


class ElasticSearchSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.ELASTIC_SEARCH
        self.task_proto = ElasticSearch
        self.task_type_callable_map = {
            ElasticSearch.TaskType.QUERY_INDEX: {
                'executor': self.execute_query_index,
                'model_types': [SourceModelType.ELASTIC_SEARCH_INDEX],
                'result_type': PlaybookTaskResultType.TABLE,
                'display_name': 'Query an ElasticSearch Index',
                'category': 'Database'
            },
        }

    def get_connector_processor(self, es_connector, **kwargs):
        generated_credentials = generate_credentials_dict(es_connector.type, es_connector.keys)
        return ElasticSearchApiProcessor(**generated_credentials)

    def execute_query_index(self, time_range: TimeRange, global_variable_set: Dict, es_task: ElasticSearch,
                            es_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not es_connector:
                raise Exception("Task execution Failed:: No ElasticSearch source found")

            query_index = es_task.query_index
            index = query_index.index.value
            query = query_index.query.value
            if not index:
                raise Exception("Task execution Failed:: No index found")

            query = query.strip()
            if global_variable_set:
                for key, value in global_variable_set.items():
                    query = query.replace(key, str(value))

            try:
                query_json = json.loads(query)
            except Exception as e:
                raise Exception(f"Error while executing ElasticSearch task: {e}")

            es_client = self.get_connector_processor(es_connector)

            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Query -> {}".format(
                "ElasticSearch", es_connector.account_id.value, query), flush=True)

            result = es_client.query(index, query_json)
            if 'hits' not in result:
                raise Exception(f"Error while executing ElasticSearch task: {result}")

            hits = result['hits']['hits']
            count_result = len(hits)
            if count_result == 0:
                raise Exception(f"No data found for the query: {query}")

            table_rows: [TableResult.TableRow] = []
            for hit in hits:
                table_columns = []
                for column, value in hit.items():
                    table_column = TableResult.TableColumn(name=StringValue(value=column),
                                                           value=StringValue(value=str(value)))
                    table_columns.append(table_column)
                table_rows.append(TableResult.TableRow(columns=table_columns))
            table = TableResult(raw_query=query,
                                total_count=UInt64Value(value=count_result),
                                rows=table_rows)
            return PlaybookTaskResult(type=PlaybookTaskResultType.TABLE, table=table, source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing ElasticSearch task: {e}")
