import logging
from typing import Dict

from executor.task_result_conditional_evaluators.task_result_evaluator import TaskResultEvaluator
from executor.task_result_conditional_evaluators.utils import numeric_function_result_operator_threshold, \
    string_function_result_operator_threshold
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, BashCommandOutputResult
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import BashCommandOutputResultRule
import re

logger = logging.getLogger(__name__)


def bash_command_grep_rule_evaluator(operator, threshold, pattern, case_sensitive,
                                     bash_command_result: BashCommandOutputResult):
    search_output = ''
    if not pattern:
        for command_output in bash_command_result.command_outputs:
            search_output += f'{command_output.output.value}\n'
    else:
        flags = 0 if case_sensitive else re.IGNORECASE
        regex = re.compile(pattern, flags)
        for command_output in bash_command_result.command_outputs:
            try:
                output_str = f'{command_output.output.value}'
                if regex.search(output_str):
                    search_output += f'{output_str}\n'
            except Exception as e:
                logger.error(f'Error while evaluating grep rule: {e}')
    if string_function_result_operator_threshold(search_output, operator, threshold):
        return True, threshold
    else:
        return False, None


def bash_command_grep_counter_rule_evaluator(operator, threshold, pattern, case_sensitive,
                                             bash_command_result: BashCommandOutputResult):
    count = 0
    flags = 0 if case_sensitive else re.IGNORECASE
    regex = re.compile(pattern, flags)
    for command_output in bash_command_result.command_outputs:
        try:
            output_str = f'{command_output.output.value}'
            if regex.search(output_str):
                count += 1
        except Exception as e:
            logger.error(f'Error while evaluating grep counter rule: {e}')
    if numeric_function_result_operator_threshold(count, operator, threshold):
        return True, count
    else:
        return False, None


def bash_command_regex_match_rule_evaluator(operator, threshold, pattern, case_sensitive,
                                            bash_command_result: BashCommandOutputResult):
    count = 0
    flags = 0 if case_sensitive else re.IGNORECASE
    regex = re.compile(pattern, flags)
    for command_output in bash_command_result.command_outputs:
        try:
            output_str = f'{command_output.output.value}'
            if regex.match(output_str):
                count += 1
        except Exception as e:
            logger.error(f'Error while evaluating regex match rule: {e}')
    if numeric_function_result_operator_threshold(count, operator, threshold):
        return True, count
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
        pattern = bash_command_result_rule.pattern.value if bash_command_result_rule.pattern else None
        case_sensitive = bash_command_result_rule.case_sensitive.value if bash_command_result_rule.case_sensitive else False

        which_one_of = bash_command_result_rule.WhichOneof('threshold')
        if which_one_of is None:
            raise ValueError('Threshold not provided for table rule')
        if which_one_of == 'numeric_value_threshold':
            threshold = bash_command_result_rule.numeric_value_threshold.value
        elif which_one_of == 'string_value_threshold':
            threshold = bash_command_result_rule.string_value_threshold.value
        else:
            raise ValueError('Threshold type not supported')

        if rule_type == bash_command_result_rule.Type.GREP:
            evaluation, value = bash_command_grep_rule_evaluator(operator, threshold, pattern, case_sensitive,
                                                                 bash_command_result)
            return evaluation, {'value': value}
        elif rule_type == bash_command_result_rule.Type.GREP_COUNTER:
            evaluation, value = bash_command_grep_counter_rule_evaluator(operator, threshold, pattern, case_sensitive,
                                                                         bash_command_result)
            return evaluation, {'value': value}
        else:
            raise ValueError(f'Rule type {rule_type} not supported')
