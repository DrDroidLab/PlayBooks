from executor.playbook_result_conditional_evaluators.global_variable_evaluators.global_variable_evaluator import \
    GlobalVariableEvaluator
from protos.base_pb2 import Operator
from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionLog
from protos.playbooks.playbook_global_variable_evaluator_pb2 import GlobalVariableResultRule, CompareGlobalVariable
from utils.proto_utils import proto_to_dict
from utils.dict_utils import get_nested_value

class CompareGlobalVariableEvaluator(GlobalVariableEvaluator):

    def evaluate(self, rule: GlobalVariableResultRule, playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> bool:
        if rule.type != GlobalVariableResultRule.Type.COMPARE_GLOBAL_VARIABLE:
            raise ValueError(f'Rule type {GlobalVariableResultRule.Type.Name(rule.type)} not supported')

        compare_global_variable: CompareGlobalVariable = rule.compare_global_variable
        operator = compare_global_variable.operator
        variable_name = compare_global_variable.variable_name.value
        threshold = compare_global_variable.threshold.value

        global_variable_set = next(
                    (tr.execution_global_variable_set for tr in playbook_task_execution_log), None)
        global_variable_set_dict = proto_to_dict(global_variable_set) if global_variable_set else {}
        value = get_nested_value(global_variable_set_dict, variable_name)

        # compare current time with first member of cron schedules
        if operator == Operator.EQUAL_O:
            return value == threshold
        elif operator == Operator.GREATER_THAN_O:
            try:
                value = int(value)
                threshold = int(threshold)
            except ValueError:
                return False
            return value > threshold
        elif operator == Operator.GREATER_THAN_EQUAL_O:
            try:
                value = int(value)
                threshold = int(threshold)
            except ValueError:
                return False
            return value >= threshold
        elif operator == Operator.LESS_THAN_O:
            try:
                value = int(value)
                threshold = int(threshold)
            except ValueError:
                return False
            return value < threshold
        elif operator == Operator.LESS_THAN_EQUAL_O:
            try:
                value = int(value)
                threshold = int(threshold)
            except ValueError:
                return False
            return value <= threshold
        else:
            raise ValueError(f'Operator {Operator.Name(operator)} not supported')
