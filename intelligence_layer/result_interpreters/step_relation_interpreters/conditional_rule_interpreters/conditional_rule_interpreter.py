from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTaskResultRule


class ConditionalRuleInterpreter:
    task_result_type = PlaybookTaskResultType.UNKNOWN

    def interpret(self, rule: PlaybookTaskResultRule):
        pass
