from executor.playbook_result_conditional_evaluators.task_result_evalutors.task_result_evaluator import TaskResultEvaluator
from protos.base_pb2 import Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_global_variable_evaluator_pb2 import GlobalVariableResultRule
from utils.proto_utils import proto_to_dict
from google.protobuf.struct_pb2 import Struct


def function_result_operator_threshold(value, operator, threshold):
    if operator == Operator.GREATER_THAN_O:
        return value > threshold
    elif operator == Operator.LESS_THAN_O:
        return value < threshold
    elif operator == Operator.GREATER_THAN_EQUAL_O:
        return value >= threshold
    elif operator == Operator.LESS_THAN_EQUAL_O:
        return value <= threshold
    elif operator == Operator.EQUAL_O:
        return value == threshold
    elif operator == Operator.NOT_EQUAL_O:
        return value != threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


class GlobalVariabletEvaluator(TaskResultEvaluator):

    def evaluate(self, rule: GlobalVariableResultRule, global_variable_set: Struct) -> (bool, dict):
        if rule.type != PlaybookTaskResultType.GLOBAL_VARIABLE:
            raise ValueError("Received unsupported rule and task types")

        print("WOOOOOOO 1", rule)
        variable_name = rule.variable_name
        operator = rule.operator
        threshold = rule.threshold.value

        global_variable_set_dict = proto_to_dict(global_variable_set) if global_variable_set else {}
        value = global_variable_set_dict.get(variable_name, None)

        print("WOOOOOOO 2", global_variable_set_dict, value)


        if not value:
            return False, {'value': value}

        evaluation = function_result_operator_threshold(value, operator, threshold)
        
        return evaluation, {'value': value}
