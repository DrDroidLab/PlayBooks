from typing import Dict

from executor.task_result_conditional_evaluators.task_result_evaluator import TaskResultEvaluator
from protos.base_pb2 import Function, Operator
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TimeseriesResult
from protos.playbooks.playbook_task_result_evaluator_pb2 import PlaybookTaskResultRule, TimeseriesResultRule


def sample_data_function_evaluator(function, sample_data):
    if function == Function.AVG_F:
        return sum(sample_data) / len(sample_data)
    elif function == Function.SUM_F:
        return sum(sample_data)
    elif function == Function.MIN_F:
        return min(sample_data)
    elif function == Function.MAX_F:
        return max(sample_data)
    else:
        raise ValueError(f'Function {function} not supported')


def function_result_operator_threshold(function_result, operator, threshold):
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


def timeseries_rolling_window_function_operator(function, operator, window, threshold,
                                                datapoints: [TimeseriesResult.LabeledMetricTimeseries.Datapoint]):
    for idx, dp in enumerate(datapoints):
        sampled_data_points = []
        max_timestamp = dp.timestamp + window * 1000
        iterator = idx
        while iterator < len(datapoints) and datapoints[iterator].timestamp <= max_timestamp:
            sampled_data_points.append(datapoints[iterator].value.value)
            iterator += 1
        function_result = sample_data_function_evaluator(function, sampled_data_points)
        if function_result_operator_threshold(function_result, operator, threshold):
            return True, function_result
    return False, None


class TimeseriesEvaluator(TaskResultEvaluator):

    def evaluate(self, rule: PlaybookTaskResultRule, task_result: PlaybookTaskResult) -> (bool, Dict):
        if rule.type != PlaybookTaskResultType.TIMESERIES or task_result.type != PlaybookTaskResultType.TIMESERIES:
            raise ValueError("Received unsupported rule and task types")
        timeseries_result = task_result.timeseries
        timeseries_rule: TimeseriesResultRule = rule.timeseries
        labeled_metric_result_timeseries = timeseries_result.labeled_metric_timeseries
        rule_type = timeseries_rule.type
        function = timeseries_rule.function
        operator = timeseries_rule.operator
        window = timeseries_rule.window.value
        threshold = timeseries_rule.threshold.value
        metric_label_values = timeseries_rule.label_value_filters
        if rule_type == TimeseriesResultRule.Type.ROLLING:
            for lmrt in labeled_metric_result_timeseries:
                if metric_label_values:
                    timeseries_label_values = lmrt.metric_label_values
                    timeseries_label_values_map = {tlv.name.value: tlv.value.value for tlv in
                                                   timeseries_label_values}
                    metric_label_values_map = {mlv.name.value: mlv.value.value for mlv in metric_label_values}
                    if not all(item in timeseries_label_values_map.items() for item in
                               metric_label_values_map.items()):
                        continue
                datapoints = lmrt.datapoints
                evaluation, value = timeseries_rolling_window_function_operator(function, operator, window,
                                                                                threshold, datapoints)
                return evaluation, {'value': value}
        else:
            raise ValueError(f'Rule type {rule_type} not supported')
        return False, None
