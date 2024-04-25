import logging

from intelligence_layer.task_result_interpreters.metric_task_result_interpreters.basic_metric_task_interpreter import \
    basic_metric_task_result_interpreter
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskExecutionResult as PlaybookMetricTaskExecutionResultProto, \
    PlaybookTaskDefinition as PlaybookTaskDefinitionProto, \
    PlaybookTaskExecutionResult as PlaybookTaskExecutionResultProto, PlaybookExecutionLog

logger = logging.getLogger(__name__)


def task_result_interpret(interpreter_type: InterpreterType, task: PlaybookTaskDefinitionProto,
                          task_result: PlaybookTaskExecutionResultProto) -> InterpretationProto:
    which_one_of = task_result.WhichOneof('result')
    if which_one_of == 'metric_task_execution_result':
        metric_task_result: PlaybookMetricTaskExecutionResultProto = task_result.metric_task_execution_result
        if interpreter_type == InterpreterType.BASIC_I:
            return basic_metric_task_result_interpreter(task, metric_task_result)


def playbook_execution_result_interpret(interpreter_type: InterpreterType,
                                        playbook_execution_logs: [PlaybookExecutionLog]) -> [InterpretationProto]:
    interpretations: [InterpretationProto] = []
    for log in playbook_execution_logs:
        try:
            interpretation_result = task_result_interpret(interpreter_type, log.task, log.task_execution_result)
            if interpretation_result:
                interpretations.append(interpretation_result)
        except Exception as e:
            logger.error(f"Failed to interpret playbook execution log with error: {e}")
            continue
    return interpretations
