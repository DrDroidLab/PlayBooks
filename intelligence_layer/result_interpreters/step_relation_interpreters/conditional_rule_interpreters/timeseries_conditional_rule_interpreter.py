from intelligence_layer.result_interpreters.step_relation_interpreters.conditional_rule_interpreters.conditional_rule_interpreter import \
    ConditionalRuleInterpreter
from protos.base_pb2 import Function, Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule
from protos.playbooks.playbook_task_result_evaluator_pb2 import TimeseriesResultRule


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


def rule_type_to_str(rule: TimeseriesResultRule):
    if rule.type == TimeseriesResultRule.Type.CUMULATIVE:
        return 'cumulative'
    elif rule.type == TimeseriesResultRule.Type.ROLLING:
        return 'rolling'
    else:
        return ''


class TimeseriesConditionalRuleInterpreter(ConditionalRuleInterpreter):
    def __int__(self):
        self.task_result_type = PlaybookTaskResultType.TIMESERIES

    def interpret(self, rule: PlaybookTaskResultRule):
        timeseries_rule: TimeseriesResultRule = rule.timeseries

        rule_type = rule_type_to_str(timeseries_rule)
        function = function_enum_to_str(timeseries_rule.function)
        operator = operator_enum_to_str(timeseries_rule.operator)
        threshold = str(timeseries_rule.threshold.value)
        window = str(timeseries_rule.window.value) if timeseries_rule.window.value else None

        interpretation_string = f'timeseries result {rule_type} {function} was {operator} {threshold}'
        if window is not None:
            interpretation_string += f'in a window of {window} seconds.'
        return interpretation_string
