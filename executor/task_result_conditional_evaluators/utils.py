from protos.base_pb2 import Operator


def numeric_function_result_operator_threshold(numeric_result, operator, threshold):
    if numeric_result is None or (not isinstance(numeric_result, int) and not isinstance(numeric_result, float)):
        raise ValueError(f'Function result {numeric_result} is not numeric')
    if threshold is None or (not isinstance(threshold, int) and not isinstance(threshold, float)):
        raise ValueError(f'Threshold {threshold} is not numeric')
    if operator == Operator.GREATER_THAN_O:
        return numeric_result > threshold
    elif operator == Operator.LESS_THAN_O:
        return numeric_result < threshold
    elif operator == Operator.GREATER_THAN_EQUAL_O:
        return numeric_result >= threshold
    elif operator == Operator.LESS_THAN_EQUAL_O:
        return numeric_result <= threshold
    elif operator == Operator.EQUAL_O:
        return numeric_result == threshold
    elif operator == Operator.NOT_EQUAL_O:
        return numeric_result != threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


def string_function_result_operator_threshold(string_result, operator, threshold):
    if string_result is None or not isinstance(string_result, str):
        raise ValueError(f'Function result {string_result} is not a string')
    if threshold is None or not isinstance(threshold, str):
        raise ValueError(f'Threshold {threshold} is not a string')
    if operator == Operator.EQUAL_O:
        return string_result == threshold
    elif operator == Operator.CONTAINS_O:
        return threshold in string_result
    else:
        raise ValueError(f'Operator {operator} not supported')
