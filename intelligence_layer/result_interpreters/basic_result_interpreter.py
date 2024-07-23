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
    TableResult, ApiResponseResult, BashCommandOutputResult, TextResult
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
                metric_expression = timeseries_result.metric_expression.value
                metric_expression = metric_expression.replace('`', '')
                metric_name = timeseries_result.metric_name.value
                metric_source = integrations_connector_type_display_name_map.get(task_result.source,
                                                                                 Source.Name(task_result.source))
                current_epoch = current_epoch_timestamp()
                uuid_str = uuid.uuid4().hex
                img_file_title = f'{metric_source}_data_{str(current_epoch)}_{uuid_str}.png'
                image_title = f'{metric_source}:{metric_expression}, {metric_name}'
                file_path = generate_local_image_path(image_name=img_file_title)
                object_url = generate_graph_for_timeseries_result(timeseries_result, file_path, image_title)
                if not object_url:
                    return Interpretation()
                if metric_name:
                    metric_name = metric_name.replace('`', '')
                    description = f'Fetched `{metric_expression}` for `{metric_name}` from `{metric_source}`'
                else:
                    description = f'Fetched `{metric_expression}` from `{metric_source}`'
                return Interpretation(
                    type=Interpretation.Type.IMAGE,
                    interpreter_type=self.type,
                    description=StringValue(value=description),
                    image_url=StringValue(value=object_url),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK,
                    file_path = StringValue(value=file_path)
                )
            except Exception as e:
                logger.error(f'Error writing image: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.TABLE or result_type == PlaybookTaskResultType.LOGS:
            try:
                data_source = integrations_connector_type_display_name_map.get(task_result.source,
                                                                               Source.Name(task_result.source))
                current_epoch = current_epoch_timestamp()
                uuid_str = uuid.uuid4().hex
                csv_file_title = f'{data_source}_data_{str(current_epoch)}_{uuid_str}.csv'
                csv_file_path = generate_local_csv_path(file_name=csv_file_title)
                table_result: TableResult = task_result.table
                object_url = generate_csv_for_table_result(table_result, csv_file_path, csv_file_title)
                description = f'{table_result.raw_query.value} from {data_source}. Total rows: {str(table_result.total_count.value)}'
                return Interpretation(
                    type=Interpretation.Type.CSV_FILE,
                    interpreter_type=self.type,
                    title = StringValue(value=csv_file_title),
                    description=StringValue(value=description),
                    file_path=StringValue(value=csv_file_path),
                    object_url=StringValue(value=object_url),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error interpreting data fetch task result: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.API_RESPONSE:
            try:
                api_response: ApiResponseResult = task_result.api_response
                description = f'Triggered `{api_response.request_url}({api_response.request_method} call)`'
                summary = f'Response status: `{api_response.response_status}` \n Response body: ```{api_response.response_body}```'
                return Interpretation(
                    type=Interpretation.Type.JSON,
                    interpreter_type=self.type,
                    description=StringValue(value=description),
                    summary = StringValue(value=summary),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error interpreting API task result: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.BASH_COMMAND_OUTPUT:
            try:
                bash_command_output: BashCommandOutputResult = task_result.bash_command_output
                description = 'Ran command ```'
                summary = 'Output received ```'
                for command_output in bash_command_output.command_outputs:
                    description += f'{command_output.command.value}\n'
                    summary += f'{command_output.output.value}\n'
                description += '```'
                summary += '```'
                return Interpretation(
                    type=Interpretation.Type.TEXT,
                    interpreter_type=self.type,
                    description=StringValue(value=description),
                    summary=StringValue(value=summary),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error interpreting bash command task result: {e}')
                raise e
        elif result_type == PlaybookTaskResultType.TEXT:
            try:
                text_output: TextResult = task_result.text
                return Interpretation(
                    type=Interpretation.Type.TEXT,
                    interpreter_type=self.type,
                    description=StringValue(value=text_output.output.value),
                    model_type = Interpretation.ModelType.PLAYBOOK_TASK
                )
            except Exception as e:
                logger.error(f'Error interpreting text task type: {e}')
                raise e

        else:
            logger.error(f'Unsupported result type: {result_type}')
            return Interpretation()


basic_result_interpreter = BasicResultInterpreter()
