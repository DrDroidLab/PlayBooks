from typing import Dict

from executor.decision_task_executor.decision_task_executor import PlaybookDecisionTaskEvaluator
from executor.decision_task_executor.else_evluation_executor import ElseEvaluator
from executor.decision_task_executor.timeseries_evaluation_executor import TimeseriesEvaluator
from protos.playbooks.playbook_pb2 import PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto


class PlaybookDecisionTaskEvaluatorFacade:

    def __init__(self):
        self._map = {}

    def register(self, evaluation_type: PlaybookDecisionTaskDefinitionProto.EvaluationType,
                 executor: PlaybookDecisionTaskEvaluator.__class__):
        self._map[evaluation_type] = executor

    def evaluate_decision_task(self, global_variable_set: Dict, decision_task: PlaybookDecisionTaskDefinitionProto):
        evaluation_type = decision_task.evaluation_type
        if evaluation_type not in self._map:
            raise ValueError(f'No executor found for evaluation type: {evaluation_type}')
        evaluator = self._map[evaluation_type]
        return evaluator.evaluate(global_variable_set, decision_task)


decision_task_evaluator = PlaybookDecisionTaskEvaluatorFacade()
decision_task_evaluator.register(PlaybookDecisionTaskDefinitionProto.EvaluationType.ELSE, ElseEvaluator())
decision_task_evaluator.register(PlaybookDecisionTaskDefinitionProto.EvaluationType.TIMESERIES, TimeseriesEvaluator())
