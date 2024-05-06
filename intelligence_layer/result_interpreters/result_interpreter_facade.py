import logging
import re

from django.conf import settings
from google.protobuf.wrappers_pb2 import StringValue

from intelligence_layer.result_interpreters.data_fetch_task_result_interpreters.basic_data_fetch_result_interpreter import \
    basic_data_fetch_task_result_interpreter
from intelligence_layer.result_interpreters.metric_task_result_interpreters.basic_metric_task_interpreter import \
    basic_metric_task_result_interpreter
from intelligence_layer.result_interpreters.metric_task_result_interpreters.llm_chat_gpt_vision_metric_task_interpreter import \
    llm_chat_gpt_vision_metric_task_result_interpreter
from intelligence_layer.result_interpreters.step_interpreter import basic_step_summariser, \
    llm_chat_gpt_step_summariser

from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskExecutionResult as PlaybookMetricTaskExecutionResultProto, \
    PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookTaskExecutionResult as PlaybookTaskExecutionResultProto, PlaybookExecutionLog, Playbook as PlaybookProto, \
    PlaybookStepExecutionLog as PlaybookStepExecutionLogProto, PlaybookStepDefinition as PlaybookStepDefinitionProto
from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def task_result_interpret(interpreter_type: InterpreterType, task: PlaybookTaskDefinitionProto,
                          task_result: PlaybookTaskExecutionResultProto) -> InterpretationProto:
    which_one_of = task_result.WhichOneof('result')
    if which_one_of == 'metric_task_execution_result':
        metric_task_result: PlaybookMetricTaskExecutionResultProto = task_result.metric_task_execution_result
        if interpreter_type == InterpreterType.BASIC_I:
            return basic_metric_task_result_interpreter(task, metric_task_result)
        elif interpreter_type == InterpreterType.LLM_CHAT_GPT_VISION_I:
            return llm_chat_gpt_vision_metric_task_result_interpreter(task, metric_task_result)
    if which_one_of == 'data_fetch_task_execution_result':
        data_fetch_task_result = task_result.data_fetch_task_execution_result
        return basic_data_fetch_task_result_interpreter(task, data_fetch_task_result)


def step_result_interpret(interpreter_type: InterpreterType, step: PlaybookStepDefinitionProto,
                          task_logs: [PlaybookExecutionLog]) -> [InterpretationProto]:
    task_interpretations = []
    for log in task_logs:
        task = log.task
        task_result = log.task_execution_result
        task_interpretations.append(task_result_interpret(interpreter_type, task, task_result))
    if interpreter_type == InterpreterType.BASIC_I:
        return basic_step_summariser(step, task_interpretations)
    elif interpreter_type == InterpreterType.LLM_CHAT_GPT_VISION_I:
        return llm_chat_gpt_step_summariser(step, task_interpretations)


def playbook_step_execution_result_interpret(interpreter: InterpreterType, playbook: PlaybookProto,
                                             step_logs: [PlaybookStepExecutionLogProto]) -> [InterpretationProto]:
    location = settings.PLATFORM_PLAYBOOKS_PAGE_LOCATION.format(playbook.id.value)
    protocol = settings.PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL
    enabled = settings.PLATFORM_PLAYBOOKS_PAGE_USE_SITE
    object_url = build_absolute_uri(None, location, protocol, enabled)
    base_title = f'Hello team, here is snapshot of playbook <{object_url}|{playbook.name.value}> ' \
                 f'that is configured for this alert'
    interpretations: [InterpretationProto] = [
        InterpretationProto(type=InterpretationProto.Type.SUMMARY, title=StringValue(value=base_title))
    ]
    for i, step_log in enumerate(step_logs):
        try:

            interpretation_result = step_result_interpret(interpreter, step_log.step, step_log.logs)
            if interpretation_result:
                step_name = step_log.step.name.value
                if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', step_name):
                    title = StringValue(value=f'Step {i + 1}: {step_name}')
                else:
                    title = StringValue(value=f'Step {i + 1}')

                base_step_interpretation = InterpretationProto(
                    type=InterpretationProto.Type.SUMMARY,
                    title=title,
                )
                interpretations.append(base_step_interpretation)
                interpretations.extend(interpretation_result)
        except Exception as e:
            logger.error(f"Failed to interpret playbook execution log with error: {e}")
            continue
    return interpretations
