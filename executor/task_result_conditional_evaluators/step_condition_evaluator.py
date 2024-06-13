from typing import Dict

from executor.task_result_conditional_evaluators.task_result_evaluator import TaskResultEvaluator
from executor.task_result_conditional_evaluators.timeseries_result_evaluator import TimeseriesEvaluator
from protos.base_pb2 import LogicalOperator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookStepResultCondition, PlaybookTaskResultRule, \
    PlaybookTaskExecutionLog


class StepConditionEvaluator:

    def __init__(self):
        self._map = {}

    def register(self, result_type: PlaybookTaskResultType, task_result_evaluator: TaskResultEvaluator):
        self._map[result_type] = task_result_evaluator

    def evaluate(self, condition: PlaybookStepResultCondition,
                 playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> (bool, Dict):
        rules: [PlaybookTaskResultRule] = condition.rules
        all_evaluations = []
        all_evaluation_results = []
        for r in rules:
            rule_task_id = r.task.id.value
            task_result = next(
                (tr.result for tr in playbook_task_execution_log if tr.task.id.value == rule_task_id), None)
            if task_result:
                task_result_evaluator = self._map.get(task_result.type)
                if not task_result_evaluator:
                    raise ValueError(f"Task result type {task_result.type} not supported")
                evaluation, evaluation_result = task_result_evaluator.evaluate(r, task_result)
                all_evaluations.append(evaluation)
                all_evaluation_results.append(evaluation_result)
        logical_operator = condition.logical_operator
        if logical_operator == LogicalOperator.AND_LO:
            return all(all_evaluations), {'evaluation_results': all_evaluation_results}
        elif logical_operator == LogicalOperator.OR_LO:
            return any(all_evaluations), {'evaluation_results': all_evaluation_results}
        elif logical_operator == LogicalOperator.NOT_LO:
            return not all(all_evaluations), {'evaluation_results': all_evaluation_results}
        else:
            raise ValueError(f"Logical operator {logical_operator} not supported")


step_condition_evaluator = StepConditionEvaluator()
step_condition_evaluator.register(PlaybookTaskResultType.TIMESERIES, TimeseriesEvaluator())
