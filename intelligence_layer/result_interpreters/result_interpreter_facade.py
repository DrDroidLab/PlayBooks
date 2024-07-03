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



def step_execution_notification_copy(current_step, step_execution_logs: [PlaybookStepExecutionLog]) -> [InterpretationProto]:
    try:
        for i in step_execution_logs:
            if i.step.id.value == current_step:
                current_step_execution_log = i
        if current_step_execution_log is None:
            print("Execution Not found for step", current_step)
        interpretations: [InterpretationProto] = []
        task_interpretations = []
        for task_execution_log in current_step_execution_log.task_execution_logs:
            if task_execution_log.interpretation and task_execution_log.interpretation.type != InterpretationProto.Type.UNKNOWN:
                task_interpretations.append(task_execution_log.interpretation)
        if current_step_execution_log.step_interpretation.type == InterpretationProto.Type.UNKNOWN and len(task_interpretations) == 0:
            return interpretations
        step_name = current_step_execution_log.step.name.value
        title = StringValue(value=f'Step {i + 1}: {step_name}')
        base_step_interpretation = InterpretationProto(
            type=InterpretationProto.Type.TEXT,
            title=title,
            model_type=InterpretationProto.ModelType.PLAYBOOK_STEP,
        )
        interpretations.append(base_step_interpretation)
        if current_step_execution_log.step_interpretation.type != InterpretationProto.Type.UNKNOWN:
            interpretations.append(current_step_execution_log.step_interpretation)
        interpretations.extend(task_interpretations)
    except Exception as e:
        logger.error(f"Failed to interpret playbook execution log with error: {e}")
        return interpretations
    return interpretations


def step_with_children_execution_notification_copy(current_step_id, printed_steps, step_execution_logs: [PlaybookStepExecutionLog]) -> [InterpretationProto]:
    try:
        interpretations: [InterpretationProto] = []
        if current_step_id not in printed_steps:
            printed_steps.append(current_step_id)
            current_step_interpretation = step_execution_notification_copy(current_step_id, step_execution_logs)
            current_step_relation_execution_logs = step_execution_logs[current_step_id].relation_execution_logs
            for relation_execution_log in current_step_relation_execution_logs:
                child_node = relation_execution_log.relation.child.id.value
                child_step_interpretation: [InterpretationProto] = []
                child_step_interpretation, printed_steps = step_with_children_execution_notification_copy(child_node, printed_steps, step_execution_logs)
                if relation_execution_log.condition:
                    relation_interpretation = relation_execution_log.interpretation
                    if relation_execution_log.evaluation_result:
                        append_string = "is True."
                    else:
                        append_string = "is False."
                    for step in child_step_interpretation:
                        if step.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
                            step.summary.value = relation_interpretation+append_string + step.summary.value
                current_step_interpretation.extend(child_step_interpretation)
            interpretations.extend(current_step_interpretation)
        else:
            return interpretations, printed_steps
    except Exception as e:
        logger.error(f"Failed to interpret playbook execution log with error: {e}")
        return interpretations, printed_steps
    return interpretations, printed_steps


def playbook_step_execution_result_interpret(step_execution_logs: [PlaybookStepExecutionLog]) -> [InterpretationProto]:
    interpretations: [InterpretationProto] = []
    all_steps = []
    for step_execution_log in step_execution_logs:
        all_steps.append(step_execution_log.step.id)
    printed_steps = []
    for current_step in step_execution_logs:
        current_step_id = current_step.step.id
        current_interpretation, printed_steps = step_with_children_execution_notification_copy(current_step_id, printed_steps, step_execution_logs)
        interpretations.extend(current_interpretation)
    return interpretations