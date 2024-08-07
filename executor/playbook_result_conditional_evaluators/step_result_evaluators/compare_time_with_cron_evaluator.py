from executor.playbook_result_conditional_evaluators.step_result_evaluators.step_result_evaluator import \
    StepResultEvaluator
from protos.base_pb2 import Operator
from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionLog
from protos.playbooks.playbook_step_result_evaluator_pb2 import PlaybookStepResultRule, CompareTimeWithCronRule
from utils.time_utils import calculate_next_cron_time, current_datetime


class CompareTimeWithCronEvaluator(StepResultEvaluator):

    def evaluate(self, rule: PlaybookStepResultRule, playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> bool:
        if rule.type != PlaybookStepResultRule.Type.COMPARE_TIME_WITH_CRON:
            raise ValueError(f'Rule type {PlaybookStepResultRule.Type.Name(rule.type)} not supported')

        current_time = current_datetime()
        compare_with_cron_rule: CompareTimeWithCronRule = rule.compare_time_with_cron
        operator = compare_with_cron_rule.operator
        cron_rule = compare_with_cron_rule.rule.value
        timezone = compare_with_cron_rule.timezone.value
        within_seconds = compare_with_cron_rule.within_seconds.value if compare_with_cron_rule.within_seconds else 60
        if within_seconds < 60:
            within_seconds = 60

        next_cron_schedule = calculate_next_cron_time(cron_rule)
        if not next_cron_schedule:
            return False

        # compare current time with first member of cron schedules
        if operator == Operator.EQUAL_O:
            if within_seconds:
                return abs(current_time - next_cron_schedule).total_seconds() <= within_seconds
            return current_time == next_cron_schedule
        elif operator == Operator.GREATER_THAN_O:
            if within_seconds:
                return current_time > next_cron_schedule and abs(
                    current_time - next_cron_schedule).total_seconds() <= within_seconds
            return current_time > next_cron_schedule
        elif operator == Operator.GREATER_THAN_EQUAL_O:
            if within_seconds:
                return current_time >= next_cron_schedule and abs(
                    current_time - next_cron_schedule).total_seconds() <= within_seconds
            return current_time >= next_cron_schedule
        elif operator == Operator.LESS_THAN_O:
            if within_seconds:
                return current_time < next_cron_schedule and abs(
                    current_time - next_cron_schedule).total_seconds() <= within_seconds
            return current_time < next_cron_schedule
        elif operator == Operator.LESS_THAN_EQUAL_O:
            if within_seconds:
                return current_time <= next_cron_schedule and abs(
                    current_time - next_cron_schedule).total_seconds() <= within_seconds
            return current_time <= next_cron_schedule
        else:
            raise ValueError(f'Operator {Operator.Name(operator)} not supported')
