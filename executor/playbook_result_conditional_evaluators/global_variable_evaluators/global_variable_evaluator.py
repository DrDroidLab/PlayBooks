from protos.playbooks.playbook_pb2 import PlaybookTaskExecutionLog
from protos.playbooks.playbook_global_variable_evaluator_pb2 import GlobalVariableResultRule


class GlobalVariableEvaluator:

    def evaluate(self, rule: GlobalVariableResultRule, playbook_task_execution_log: [PlaybookTaskExecutionLog]) -> bool:
        pass
