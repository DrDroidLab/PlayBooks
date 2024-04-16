from typing import Dict

from google.protobuf.wrappers_pb2 import BoolValue

from executor.decision_task_executor.decision_task_executor import PlaybookDecisionTaskEvaluator
from protos.playbooks.playbook_pb2 import PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto, \
    PlaybookDecisionTaskExecutionResult


class ElseEvaluator(PlaybookDecisionTaskEvaluator):

    def __init__(self):
        self.type = PlaybookDecisionTaskDefinitionProto.EvaluationType.ELSE

    def evaluate(self, global_variable_set: Dict,
                 task: PlaybookDecisionTaskDefinitionProto) -> PlaybookDecisionTaskExecutionResult:
        else_evaluation_task = task.else_evaluation_task
        next_task = else_evaluation_task.next_task
        return PlaybookDecisionTaskExecutionResult(
            result=PlaybookDecisionTaskExecutionResult.Result(
                type=PlaybookDecisionTaskExecutionResult.Result.Type.ELSE_EVALUATION_CONDITION,
                next_task=next_task,
                else_evaluation_condition=PlaybookDecisionTaskExecutionResult.Result.ElseEvaluation(
                    evaluation=BoolValue(value=True),
                )
            )
        )
