from typing import Dict

from executor.task_result_conditional_evaluators.task_result_evaluator import TaskResultEvaluator
from protos.base_pb2 import Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, BashCommandOutputResult
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import BashCommandOutputResultRule
import re


def numeric_function_result_operator_threshold(function_result, operator, threshold):
    if operator == Operator.EQUAL_O:
        return function_result == threshold
    elif operator == Operator.GREATER_THAN_EQUAL_O:
        return function_result >= threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


def grep_counter(pattern, output_lines, case_sensitive=True):
    count = 0
    try:
        flags = 0 if case_sensitive else re.IGNORECASE
        regex = re.compile(pattern, flags)
        for line in output_lines:
            if regex.search(line):
                count += 1
    
    except Exception as e:
        print(f'Error: {e}')
    return count

def command_output_grep_evaluator(operator, pattern, case_sensitive, grep_count_required, bash_command_result: BashCommandOutputResult):
    summary = ''
    for command_output in bash_command_result.command_outputs:
        summary += f'{command_output.output.value}\n'
    grep_count_evaluated = grep_counter(pattern, summary, case_sensitive)
    if numeric_function_result_operator_threshold(grep_count_evaluated, operator, grep_count_required):
        return True, grep_count_evaluated
    else:
        return False, None


class BashCommandOutputResultEvaluator(TaskResultEvaluator):
    def evaluate(self, rule: PlaybookTaskResultRule, task_result: PlaybookTaskResult) -> (bool, Dict):
        if rule.type != PlaybookTaskResultType.BASH_COMMAND_OUTPUT or task_result.type != PlaybookTaskResultType.BASH_COMMAND_OUTPUT:
            raise ValueError("Received unsupported rule and task types")
        bash_command_result: BashCommandOutputResult = task_result.bash_command_output
        bash_command_result_rule: BashCommandOutputResultRule = rule.bash_command_output
        rule_type = bash_command_result_rule.type
        operator = bash_command_result_rule.operator
        pattern = bash_command_result_rule.pattern
        case_sensitive = bash_command_result_rule.case_sensitive
        grep_count = bash_command_result_rule.grep_count
        if rule_type == bash_command_result_rule.Type.GREP_COUNTER:
            evaluation, value = command_output_grep_evaluator(operator, pattern, case_sensitive, grep_count, bash_command_result)
            return evaluation, {'value': value}
        else:
            raise ValueError(f'Rule type {rule_type} not supported')
