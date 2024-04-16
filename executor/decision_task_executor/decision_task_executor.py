from typing import Dict

from protos.playbooks.playbook_pb2 import PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto, \
    PlaybookDecisionTaskExecutionResult


class PlaybookDecisionTaskEvaluator:
    type: PlaybookDecisionTaskDefinitionProto.EvaluationType = PlaybookDecisionTaskDefinitionProto.EvaluationType.UNKNOWN_ET
    input_type_evaluator_callable_map = {}

    @classmethod
    def get_input_type_evaluator_callable_map(cls):
        return cls.input_type_evaluator_callable_map

    def evaluate(self, global_variable_set: Dict,
                 task: PlaybookDecisionTaskDefinitionProto) -> PlaybookDecisionTaskExecutionResult:
        pass
