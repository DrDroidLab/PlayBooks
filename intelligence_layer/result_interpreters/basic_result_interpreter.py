import logging

import uuid
from google.protobuf.wrappers_pb2 import StringValue

from connectors.models import integrations_connector_type_display_name_map
from intelligence_layer.utils import generate_graph_for_timeseries_result, table_result_to_df, \
    generate_csv_for_table_result
from intelligence_layer.result_interpreters.result_interpreter import ResultInterpreter
from media.utils import generate_local_image_path, generate_local_csv_path
from protos.base_pb2 import Source
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TimeseriesResult, \
    TableResult
from utils.time_utils import current_epoch_timestamp

logger = logging.getLogger(__name__)


class BasicResultInterpreter(ResultInterpreter):
    def __init__(self):
        self.type = InterpreterType.BASIC_I

    def interpret(self, task_result: PlaybookTaskResult):
        result_type = task_result.type
        if result_type == PlaybookTaskResultType.TIMESERIES:
            try:
                timeseries_result: TimeseriesResult = task_result.timeseries
                file_key = generate_local_image_path()
                metric_expression = timeseries_result.metric_expression.value
                metric_expression = metric_expression.replace('`', '')
                metric_name = timeseries_result.metric_name.value
                metric_source = integrations_connector_type_display_name_map.get(task_result.source,
                                                                                 Source.Name(task_result.source))
                object_url = generate_graph_for_timeseries_result(timeseries_result, file_key, metric_expression)
                if not object_url:
                    return Interpretation()
                if metric_name:
                    metric_name = metric_name.replace('`', '')
                    title = f'Fetched `{metric_expression}` for `{metric_name}` from `{metric_source}`'
                else:
                    title = f'Fetched `{metric_expression}` from `{metric_source}`'
                return Interpretation(
                    type=Interpretation.Type.IMAGE,
                    interpreter_type=self.type,
                    title=StringValue(value=title),
                    image_url=StringValue(value=object_url),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error writing image: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.TABLE:
            try:
                data_source = integrations_connector_type_display_name_map.get(task_result.source,
                                                                               Source.Name(task_result.source))
                current_epoch = current_epoch_timestamp()
                uuid_str = uuid.uuid4().hex
                csv_file_title = f'{data_source}_data_{str(current_epoch)}_{uuid_str}.csv'
                csv_file_path = generate_local_csv_path(file_name=csv_file_title)
                table_result: TableResult = task_result.table
                object_url = generate_csv_for_table_result(table_result, csv_file_path, csv_file_title)
                title = f'Fetched `{table_result.raw_query.value}` from `{data_source}`. Total rows: {str(table_result.total_count.value)}'
                return Interpretation(
                    type=Interpretation.Type.CSV_FILE,
                    interpreter_type=self.type,
                    title=StringValue(value=title),
                    file_path=StringValue(value=csv_file_path),
                    object_url=StringValue(value=object_url),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error interpreting data fetch task result: {e}')
                raise e
        else:
            logger.error(f'Unsupported result type: {result_type}')
            return Interpretation()


basic_result_interpreter = BasicResultInterpreter()
