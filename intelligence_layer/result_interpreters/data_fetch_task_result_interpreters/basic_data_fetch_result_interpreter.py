import logging

import pandas as pd
from google.protobuf.wrappers_pb2 import StringValue

from media.utils import generate_local_csv_path
from protos.base_pb2 import Source
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookDataFetchTaskExecutionResult as PlaybookDataFetchTaskExecutionResultProto, TableResult as TableResultProto

logger = logging.getLogger(__name__)

database_source_display_name_map = {
    Source.CLICKHOUSE: 'Clickhouse',
    Source.POSTGRES: 'Postgres',
    Source.SQL_DATABASE_CONNECTION: 'Database',
}


def table_result_to_df(table_result, task_name='Data Fetch Task'):
    data = []
    for row in table_result.rows:
        columns = row.columns
        data.append({col.name.value: col.value for col in columns})

    return pd.DataFrame(data)


def basic_data_fetch_task_result_interpreter(task: PlaybookTaskDefinitionProto,
                                             task_result: PlaybookDataFetchTaskExecutionResultProto) -> InterpretationProto:
    file_key = generate_local_csv_path()
    data_fetch_task_name = task_result.data_fetch_task_name.value
    data_source = database_source_display_name_map.get(task_result.data_source, 'Database')
    result: PlaybookDataFetchTaskExecutionResultProto = task_result.result
    result_type = result.type
    if result_type == PlaybookDataFetchTaskExecutionResultProto.Result.Type.TABLE_RESULT:
        try:
            table_result: TableResultProto = result.table_result
            df = table_result_to_df(table_result, data_fetch_task_name)
            df.to_csv(file_key, index=False)
            title = f'Fetched `{table_result.raw_query.value}` from `{data_source}`. Total rows: {str(table_result.total_count.value)}'
            return InterpretationProto(
                type=InterpretationProto.Type.CSV_FILE,
                title=StringValue(value=title),
                file_path=StringValue(value=file_key),
            )
        except Exception as e:
            logger.error(f'Error interpreting data fetch task result: {e}')
            raise e
    else:
        logger.error(f'Unsupported result type: {result_type}')
        raise NotImplementedError(f'Unsupported result type: {result_type}')
