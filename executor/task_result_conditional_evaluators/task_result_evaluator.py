from typing import Dict

from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule


class TaskResultEvaluator:

    def evaluate(self, rule: PlaybookTaskResultRule, task_result: PlaybookTaskResult) -> (bool, Dict):
        pass
