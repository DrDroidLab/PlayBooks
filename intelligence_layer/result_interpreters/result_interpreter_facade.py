import logging
import re

from django.conf import settings
from google.protobuf.wrappers_pb2 import StringValue

from intelligence_layer.result_interpreters.basic_result_interpreter import basic_result_interpreter
from intelligence_layer.result_interpreters.llm_chat_gpt_vision_result_interpreter import \
    llm_chat_gpt_vision_result_interpreter
from intelligence_layer.result_interpreters.step_interpreter import basic_step_summariser, \
    llm_chat_gpt_step_summariser

from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.playbook_pb2 import PlaybookTask, PlaybookStep, PlaybookStepExecutionLog, Playbook
from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def task_result_interpret(interpreter_type: InterpreterType, task: PlaybookTask,
                          task_result: PlaybookTaskResult) -> InterpretationProto:
    if interpreter_type == InterpreterType.BASIC_I:
        return basic_result_interpreter.interpret(task_result)
    elif interpreter_type == InterpreterType.LLM_CHAT_GPT_VISION_I:
        return llm_chat_gpt_vision_result_interpreter.interpret(task_result)
    else:
        logger.error(f"Unsupported interpreter type: {interpreter_type}")
        return InterpretationProto()


def step_result_interpret(interpreter_type: InterpreterType, step: PlaybookStep,
                          task_interpretations: [InterpretationProto]) -> InterpretationProto:
    if interpreter_type == InterpreterType.BASIC_I:
        return basic_step_summariser(step, task_interpretations)
    elif interpreter_type == InterpreterType.LLM_CHAT_GPT_VISION_I:
        return llm_chat_gpt_step_summariser(step, task_interpretations)
    else:
        logger.error(f"Unsupported interpreter type: {interpreter_type}")
        return InterpretationProto()


def playbook_step_execution_result_interpret(playbook: Playbook,
                                             step_logs: [PlaybookStepExecutionLog]) -> [InterpretationProto]:
    location = settings.PLATFORM_PLAYBOOKS_PAGE_LOCATION.format(playbook.id.value)
    protocol = settings.PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL
    enabled = settings.PLATFORM_PLAYBOOKS_PAGE_USE_SITE
    object_url = build_absolute_uri(None, location, protocol, enabled)
    interpretations: [InterpretationProto] = [
        InterpretationProto(type=InterpretationProto.Type.SUMMARY, title=StringValue(value=playbook.name.value),
                            description=StringValue(value=object_url))
    ]
    for i, step_log in enumerate(step_logs):
        try:
            task_interpretations = []
            for task_execution_log in step_log.task_execution_logs:
                if task_execution_log.interpretation and task_execution_log.interpretation.type != InterpretationProto.Type.UNKNOWN:
                    task_interpretations.append(task_execution_log.interpretation)
            if step_log.step_interpretation.type == InterpretationProto.Type.UNKNOWN and len(task_interpretations) == 0:
                continue
            step_name = step_log.step.name.value
            # if step_name and not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', step_name):
            title = StringValue(value=f'Step {i + 1}: {step_name}')
            # else:
            #     title = StringValue(value=f'Step {i + 1}')

            base_step_interpretation = InterpretationProto(
                type=InterpretationProto.Type.SUMMARY,
                title=title,
            )
            interpretations.append(base_step_interpretation)
            if step_log.step_interpretation.type != InterpretationProto.Type.UNKNOWN:
                interpretations.append(step_log.step_interpretation)
            interpretations.extend(task_interpretations)
        except Exception as e:
            logger.error(f"Failed to interpret playbook execution log with error: {e}")
            continue
    return interpretations
