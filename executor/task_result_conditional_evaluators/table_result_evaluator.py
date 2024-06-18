from typing import Dict

from executor.task_result_conditional_evaluators.task_result_evaluator import TaskResultEvaluator
from protos.base_pb2 import Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TableResult
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import TableResultRule


def numeric_function_result_operator_threshold(function_result, operator, threshold):
    if operator == Operator.GREATER_THAN_O:
        return function_result > threshold
    elif operator == Operator.LESS_THAN_O:
        return function_result < threshold
    elif operator == Operator.GREATER_THAN_EQUAL_O:
        return function_result >= threshold
    elif operator == Operator.LESS_THAN_EQUAL_O:
        return function_result <= threshold
    elif operator == Operator.EQUAL_O:
        return function_result == threshold
    elif operator == Operator.NOT_EQUAL_O:
        return function_result != threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


def string_function_result_operator_threshold(function_result, operator, threshold):
    if operator == Operator.EQUAL_O:
        return function_result == threshold
    elif operator == Operator.LIKE_O:
        return function_result in threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


def table_row_count_operator(operator, threshold, row_count):
    if type(threshold) != float and type(threshold) != int:
        raise ValueError('Threshold type not supported for row count')
    return numeric_function_result_operator_threshold(row_count, operator, threshold), row_count


def table_column_value_operator(operator, column, table_result: TableResult, threshold):
    first_row = table_result.rows[0]
    if not first_row:
        raise ValueError('Table result does not contain any rows')
    column_value = None
    for column in first_row.columns:
        if column.name.value == column:
            column_value = column.value.value
            break
    if not column_value:
        raise ValueError(f'Column {column} not found in table result')
    if type(threshold) == float or type(threshold) == int:
        column_value = float(column_value)
        return numeric_function_result_operator_threshold(column_value, operator, threshold), column_value
    elif type(threshold) == str:
        return string_function_result_operator_threshold(column_value, operator, threshold), column_value
    return False, None


class TableResultEvaluator(TaskResultEvaluator):

    def evaluate(self, rule: PlaybookTaskResultRule, task_result: PlaybookTaskResult) -> (bool, Dict):
        if rule.type != PlaybookTaskResultType.TABLE or task_result.type != PlaybookTaskResultType.TABLE:
            raise ValueError("Received unsupported rule and task types")
        table_result = task_result.table
        table_result_rule: TableResultRule = rule.table
        rule_type = table_result_rule.type
        operator = table_result_rule.operator
        column = table_result_rule.column_name.value
        which_one_of = table_result_rule.WhichOneof('threshold')
        if which_one_of is None:
            raise ValueError('Threshold not provided for table rule')
        if which_one_of == 'numeric_value_threshold':
            threshold = table_result_rule.numeric_value_threshold.value
        elif which_one_of == 'string_value_threshold':
            threshold = table_result_rule.string_value_threshold.value
        else:
            raise ValueError('Threshold type not supported')
        if rule_type == TableResultRule.Type.ROW_COUNT:
            evaluation, value = table_row_count_operator(operator, threshold, table_result.total_count.value)
            return evaluation, {'value': value}
        elif rule_type == TableResultRule.Type.COLUMN_VALUE:
            evaluation, value = table_column_value_operator(operator, column, table_result, threshold)
            return evaluation, {'value': value}
        else:
            raise ValueError(f'Rule type {rule_type} not supported')
