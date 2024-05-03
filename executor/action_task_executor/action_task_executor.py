from typing import Dict

from protos.playbooks.playbook_pb2 import PlaybookActionTaskDefinition as PlaybookActionTaskDefinitionProto, \
    PlaybookActionTaskExecutionResult as PlaybookActionTaskExecutionResultProto


class PlaybookActionTaskExecutor:
    source: PlaybookActionTaskDefinitionProto.Source = PlaybookActionTaskDefinitionProto.Source.UNKNOWN
    task_type_callable_map = {}

    @classmethod
    def get_task_type_callable_map(cls):
        return cls.task_type_callable_map

    def execute(self, global_variable_set: Dict,
                task: PlaybookActionTaskDefinitionProto) -> PlaybookActionTaskExecutionResultProto:
        pass
