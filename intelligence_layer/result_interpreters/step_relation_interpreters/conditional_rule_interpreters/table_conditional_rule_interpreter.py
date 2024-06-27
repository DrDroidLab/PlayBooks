from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.conditional_rule_interpreter import \
    ConditionalRuleInterpreter
from protos.base_pb2 import Function, Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import TableResultRule


def function_enum_to_str(function: Function):
    if function == Function.AVG_F:
        return 'average'
    elif function == Function.SUM_F:
        return 'sum'
    elif function == Function.MIN_F:
        return 'minimum'
    elif function == Function.MAX_F:
        return 'maximum'
    elif function == Function.LAST_F:
        return 'latest'
    else:
        return ''


def operator_enum_to_str(operator: Operator):
    if operator == Operator.GREATER_THAN_O:
        return 'greater than'
    elif operator == Operator.GREATER_THAN_EQUAL_O:
        return 'greater than or equal to'
    elif operator == Operator.LESS_THAN_O:
        return 'less than'
    elif operator == Operator.LESS_THAN_EQUAL_O:
        return 'less than or equal to'
    elif operator == Operator.EQUAL_O:
        return 'equal to'
    elif operator == Operator.NOT_EQUAL_O:
        return 'not equal to'
    else:
        return ''


def rule_type_to_str(rule: TableResultRule):
    if rule.type == TableResultRule.Type.ROW_COUNT:
        return 'row count'
    elif rule.type == TableResultRule.Type.COLUMN_VALUE:
        return 'value'
    else:
        return ''


class TableConditionalRuleInterpreter(ConditionalRuleInterpreter):
    def __int__(self):
        self.task_result_type = PlaybookTaskResultType.TABLE

    def interpret(self, rule: PlaybookTaskResultRule):
        table_rule: TableResultRule = rule.table

        rule_type = rule_type_to_str(table_rule)
        operator = operator_enum_to_str(table_rule.operator)
        column_name = table_rule.column_name.value if table_rule.column_name.value else None
        threshold = ''
        which_one_of = table_rule.WhichOneof('threshold')
        if which_one_of == 'numeric_value_threshold':
            threshold = str(table_rule.numeric_value_threshold.value)
        elif which_one_of == 'string_value_threshold':
            threshold = table_rule.string_value_threshold.value

        if rule.type == TableResultRule.Type.ROW_COUNT:
            interpretation_string = f'table result {rule_type} was {operator} {threshold}'
        elif rule.type == TableResultRule.Type.COLUMN_VALUE:
            interpretation_string = f'table column {column_name} value was {operator} {threshold}'
        else:
            interpretation_string = ''
        return interpretation_string
