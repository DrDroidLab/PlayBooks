from typing import Dict

from google.protobuf.wrappers_pb2 import DoubleValue, BoolValue

from executor.decision_task_executor.decision_task_executor import PlaybookDecisionTaskEvaluator
from protos.playbooks.playbook_pb2 import PlaybookDecisionTaskDefinition as PlaybookDecisionTaskDefinitionProto, \
    TimeseriesEvaluationTask, PlaybookDecisionTaskExecutionResult, PlaybookMetricTaskExecutionResult, \
    EvaluationConditionFunction, EvaluationConditionOperator, TimeseriesResult as TimeseriesResultProto


def sample_data_function_evaluator(function, sample_data):
    if function == EvaluationConditionFunction.ECF_AVG:
        return sum(sample_data) / len(sample_data)
    elif function == EvaluationConditionFunction.ECF_SUM:
        return sum(sample_data)
    elif function == EvaluationConditionFunction.ECF_MIN:
        return min(sample_data)
    elif function == EvaluationConditionFunction.ECF_MAX:
        return max(sample_data)
    else:
        raise ValueError(f'Function {function} not supported')


def function_result_operator_threshold(function_result, operator, threshold):
    if operator == EvaluationConditionOperator.GREATER_THAN:
        return function_result > threshold
    elif operator == EvaluationConditionOperator.LESS_THAN:
        return function_result < threshold
    elif operator == EvaluationConditionOperator.GREATER_THAN_EQUAL:
        return function_result >= threshold
    elif operator == EvaluationConditionOperator.LESS_THAN_EQUAL:
        return function_result <= threshold
    elif operator == EvaluationConditionOperator.EQUAL:
        return function_result == threshold
    elif operator == EvaluationConditionOperator.NOT_EQUAL:
        return function_result != threshold
    else:
        raise ValueError(f'Operator {operator} not supported')


def timeseries_rolling_window_function_operator(function, operator, window, threshold,
                                                datapoints: [TimeseriesResultProto.LabeledMetricTimeseries.Datapoint]):
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


class TimeseriesEvaluator(PlaybookDecisionTaskEvaluator):

    def __init__(self):
        self.type = PlaybookDecisionTaskDefinitionProto.EvaluationType.TIMESERIES
        self.input_type_evaluator_callable_map = {
            TimeseriesEvaluationTask.InputType.METRIC_TIMESERIES: self.evaluate_metric_timeseries_task
        }

    def evaluate(self, global_variable_set: Dict,
                 task: PlaybookDecisionTaskDefinitionProto) -> PlaybookDecisionTaskExecutionResult:
        timeseries_evaluation_task = task.timeseries_evaluation_task
        input_type = timeseries_evaluation_task.input_type
        if input_type in self.input_type_evaluator_callable_map:
            return self.input_type_evaluator_callable_map[input_type](global_variable_set, timeseries_evaluation_task)
        else:
            raise Exception(f"Input type {input_type} not supported")

    def evaluate_metric_timeseries_task(self, global_variable_set: Dict,
                                        timeseries_evaluation_task: TimeseriesEvaluationTask) -> \
            PlaybookDecisionTaskExecutionResult:
        task_evaluation_result = PlaybookDecisionTaskExecutionResult()
        rules = timeseries_evaluation_task.rules
        metric_result = timeseries_evaluation_task.metric_timeseries_input.result
        if metric_result.type != PlaybookMetricTaskExecutionResult.Result.Type.TIMESERIES:
            raise ValueError(f'Metric result type {metric_result.result_type} not supported')
        labeled_metric_result_timeseries = metric_result.timeseries.labeled_metric_timeseries
        triggered_rule = None
        evaluated_value = None
        for rule in rules:
            rule_type = rule.type
            function = rule.function
            operator = rule.operator
            window = rule.window.value
            threshold = rule.threshold.value
            metric_label_values = rule.label_values
            if rule_type == TimeseriesEvaluationTask.Rule.Type.ROLLING:
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
                    if evaluation:
                        triggered_rule = rule
                        evaluated_value = value
                        break
            else:
                raise ValueError(f'Rule type {rule_type} not supported')
        if triggered_rule:
            task_evaluation_result = PlaybookDecisionTaskExecutionResult(
                result=PlaybookDecisionTaskExecutionResult.Result(
                    type=PlaybookDecisionTaskExecutionResult.Result.Type.TIMESERIES_EVALUATION_CONDITION,
                    next_task=triggered_rule.next_task,
                    timeseries_evaluation_condition=PlaybookDecisionTaskExecutionResult.Result.TimeseriesEvaluation(
                        evaluation=BoolValue(value=True),
                        rule=triggered_rule,
                        value=DoubleValue(value=evaluated_value)
                    )
                )
            )

        return task_evaluation_result
