from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionLog
from protos.playbooks.playbook_step_result_evaluator_pb2 import PlaybookStepResultRule


class StepResultEvaluator:

    def evaluate(self, rule: PlaybookStepResultRule, playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> bool:
        pass
