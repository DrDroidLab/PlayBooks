import logging

import pandas as pd
from google.protobuf.wrappers_pb2 import StringValue

from intelligence_layer.result_interpreters.metric_task_result_interpreters.utils import \
    metric_source_displace_name_map, generate_graph_for_metric_timeseries_result
from media.utils import generate_local_image_path
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskExecutionResult as PlaybookMetricTaskExecutionResultProto, \
    PlaybookTaskDefinition as PlaybookTaskDefinitionProto, TableResult as TableResultProto

logger = logging.getLogger(__name__)


def table_result_to_df(table_result, task_name='Data Fetch Task'):
    data = []
    for row in table_result.rows:
        columns = row.columns
        data.append({col.name.value: col.value for col in columns})

    return pd.DataFrame(data)


def basic_metric_task_result_interpreter(task: PlaybookTaskDefinitionProto,
                                         task_result: PlaybookMetricTaskExecutionResultProto) -> InterpretationProto:
    file_key = generate_local_image_path()
    metric_expression = task_result.metric_expression.value
    metric_expression = metric_expression.replace('`', '')
    metric_name = task_result.metric_name.value
    metric_source = metric_source_displace_name_map.get(task_result.metric_source)
    result = task_result.result
    result_type = result.type
    if result_type == PlaybookMetricTaskExecutionResultProto.Result.Type.TIMESERIES:
        try:
            object_url = generate_graph_for_metric_timeseries_result(result, file_key, task.name.value)
            if metric_name:
                metric_name = metric_name.replace('`', '')
                title = f'Fetched `{metric_expression}` for `{metric_name}` from `{metric_source}`'
            else:
                title = f'Fetched `{metric_expression}` from `{metric_source}`'
            return InterpretationProto(
                type=InterpretationProto.Type.IMAGE,
                title=StringValue(value=title),
                image_url=StringValue(value=object_url),
            )
        except Exception as e:
            logger.error(f'Error writing image: {e}')
            raise e
    elif result_type == PlaybookMetricTaskExecutionResultProto.Result.Type.TABLE_RESULT:
        try:
            table_result: TableResultProto = result.table_result
            df = table_result_to_df(table_result, metric_name)
            df.to_csv(file_key, index=False)
            title = f'Fetched `{metric_expression}` from `{metric_source}`.'
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
