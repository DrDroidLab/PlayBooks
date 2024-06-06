import logging

from google.protobuf.wrappers_pb2 import StringValue

from connectors.models import integrations_connector_type_display_name_map
from intelligence_layer.utils import generate_graph_for_metric_timeseries_result, table_result_to_df
from intelligence_layer.result_interpreters.result_interpreter import ResultInterpreter
from media.utils import generate_local_image_path, generate_local_csv_path
from protos.base_pb2 import Source
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TimeseriesResult, \
    TableResult

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
                object_url = generate_graph_for_metric_timeseries_result(timeseries_result, file_key, metric_expression)
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
                    image_url=StringValue(value=object_url)
                )
            except Exception as e:
                logger.error(f'Error writing image: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.TABLE:
            try:
                file_key = generate_local_csv_path()
                data_source = integrations_connector_type_display_name_map.get(task_result.source,
                                                                               Source.Name(task_result.source))
                table_result: TableResult = task_result.table
                df = table_result_to_df(table_result)
                df.to_csv(file_key, index=False)
                title = f'Fetched `{table_result.raw_query.value}` from `{data_source}`. Total rows: {str(table_result.total_count.value)}'
                return Interpretation(
                    type=Interpretation.Type.CSV_FILE,
                    interpreter_type=self.type,
                    title=StringValue(value=title),
                    file_path=StringValue(value=file_key),
                )
            except Exception as e:
                logger.error(f'Error interpreting data fetch task result: {e}')
                raise e
        else:
            logger.error(f'Unsupported result type: {result_type}')
            return Interpretation()


basic_result_interpreter = BasicResultInterpreter()
