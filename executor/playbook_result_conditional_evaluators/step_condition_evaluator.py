from typing import Dict

from executor.playbook_result_conditional_evaluators.step_result_evaluators.compare_time_with_cron_evaluator import \
    CompareTimeWithCronEvaluator
from executor.playbook_result_conditional_evaluators.step_result_evaluators.step_result_evaluator import \
    StepResultEvaluator
from executor.playbook_result_conditional_evaluators.task_result_evalutors.table_result_evaluator import \
    LogsResultEvaluator, TableResultEvaluator
from executor.playbook_result_conditional_evaluators.task_result_evalutors.task_result_evaluator import \
    TaskResultEvaluator
from executor.playbook_result_conditional_evaluators.task_result_evalutors.timeseries_result_evaluator import \
    TimeseriesResultEvaluator
from executor.playbook_result_conditional_evaluators.task_result_evalutors.bash_command_result_evaluator import \
    BashCommandOutputResultEvaluator
from executor.playbook_result_conditional_evaluators.task_result_evalutors.global_variable_evaluator import \
    GlobalVariabletEvaluator
from protos.base_pb2 import LogicalOperator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookStepResultCondition, PlaybookTaskResultRule, \
    PlaybookTaskExecutionLog
from protos.playbooks.playbook_step_result_evaluator_pb2 import PlaybookStepResultRule


class StepConditionEvaluator:

    def __init__(self):
        self._task_rule_map = {}
        self._step_rule_map = {}
        self._variable_rule_map = {}

    def register_task_result_evaluator(self, result_type: PlaybookTaskResultType,
                                       task_result_evaluator: TaskResultEvaluator):
        self._task_rule_map[result_type] = task_result_evaluator

    def register_step_result_evaluator(self, step_rule_type: PlaybookStepResultRule.Type,
                                       step_result_evaluator: StepResultEvaluator):
        self._step_rule_map[step_rule_type] = step_result_evaluator

    def register_variable_evaluator(self, variable_rule_type: PlaybookTaskResultType,
                                       variable_evaluator: TaskResultEvaluator):
        self._variable_rule_map[variable_rule_type] = variable_evaluator

    def evaluate(self, condition: PlaybookStepResultCondition,
                 playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> (bool, Dict):
        if not condition.rule_sets:
            return True, {}
        rule_sets: [PlaybookStepResultCondition.RuleSet] = condition.rule_sets
        rs_logical_operator = condition.logical_operator
        all_rs_evaluations = []
        all_rs_evaluation_results = []
        for rs in rule_sets:
            rules: [PlaybookTaskResultRule] = rs.rules
            all_evaluations = []
            for r in rules:
                rule_task_id = r.task.id.value
                task_result = next(
                    (tr.result for tr in playbook_task_execution_log if tr.task.id.value == rule_task_id), None)
                if task_result:
                    task_result_evaluator = self._task_rule_map.get(task_result.type)
                    if not task_result_evaluator:
                        raise ValueError(f"Task result type {task_result.type} not supported")
                    evaluation, evaluation_result = task_result_evaluator.evaluate(r, task_result)
                    all_evaluations.append(evaluation)
                    all_rs_evaluation_results.append(evaluation_result)

            step_rules: [PlaybookTaskResultRule] = rs.step_rules
            for sr in step_rules:
                step_result_evaluator = self._step_rule_map.get(sr.type)
                if not step_result_evaluator:
                    raise ValueError(f"Step result type {PlaybookStepResultRule.Type.Name(sr.type)} not supported")
                evaluation = step_result_evaluator.evaluate(sr, playbook_task_execution_log)
                all_evaluations.append(evaluation)

            variable_rules: [PlaybookTaskResultRule] = rs.variable_rules
            for vr in variable_rules:
                variable_evaluator = self._variable_rule_map.get()
                print("WOOOOOOO 0", variable_evaluator, vr)
                global_variable_set = next(
                    (tr.execution_global_variable_set for tr in playbook_task_execution_log), None)
                if not variable_evaluator:
                    raise ValueError(f"Task result type {task_result.type} not supported")
                evaluation = variable_evaluator.evaluate(vr, global_variable_set)
                all_evaluations.append(evaluation)
            
            logical_operator = rs.logical_operator
            if logical_operator == LogicalOperator.AND_LO:
                all_rs_evaluations.append(all(all_evaluations))
            elif logical_operator == LogicalOperator.OR_LO:
                all_rs_evaluations.append(any(all_evaluations))
            elif logical_operator == LogicalOperator.NOT_LO and len(all_evaluations) == 1:
                all_rs_evaluations.append(not all(all_evaluations))
            elif logical_operator == LogicalOperator.NOT_LO:
                if len(all_evaluations) > 1:
                    raise ValueError(f"Logical operator {logical_operator} not supported for multiple evaluations")
                all_rs_evaluations.append(all(all_evaluations))
            elif logical_operator == LogicalOperator.UNKNOWN_LO:
                if len(all_evaluations) == 1:
                    all_rs_evaluations.append(all_evaluations[0])
                elif len(all_evaluations) == 0:
                    all_rs_evaluations.append(True)
            else:
                raise ValueError(f"Logical operator {logical_operator} not supported")

        if rs_logical_operator == LogicalOperator.AND_LO:
            return all(all_rs_evaluations), {'evaluation_results': all_rs_evaluation_results}
        elif rs_logical_operator == LogicalOperator.OR_LO:
            return any(all_rs_evaluations), {'evaluation_results': all_rs_evaluation_results}
        else:
            raise ValueError(f"Logical operator {rs_logical_operator} not supported")


step_condition_evaluator = StepConditionEvaluator()
step_condition_evaluator.register_task_result_evaluator(PlaybookTaskResultType.TIMESERIES, TimeseriesResultEvaluator())
step_condition_evaluator.register_task_result_evaluator(PlaybookTaskResultType.TABLE, TableResultEvaluator())
step_condition_evaluator.register_task_result_evaluator(PlaybookTaskResultType.LOGS, LogsResultEvaluator())
step_condition_evaluator.register_task_result_evaluator(PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                                                        BashCommandOutputResultEvaluator())

step_condition_evaluator.register_step_result_evaluator(PlaybookStepResultRule.Type.COMPARE_TIME_WITH_CRON,
                                                        CompareTimeWithCronEvaluator())
step_condition_evaluator.register_variable_evaluator(PlaybookTaskResultType.GLOBAL_VARIABLE,
                                                        GlobalVariabletEvaluator())
