from typing import Dict

from protos.base_pb2 import TimeRange
from protos.playbooks.playbook_pb2 import PlaybookMetricTaskDefinition as PlaybookMetricTaskDefinitionProto, \
    PlaybookMetricTaskExecutionResult


class PlaybookMetricTaskExecutor:
    source: PlaybookMetricTaskDefinitionProto.Source = PlaybookMetricTaskDefinitionProto.Source.UNKNOWN
    task_type_callable_map = {}

    @classmethod
    def get_task_type_callable_map(cls):
        return cls.task_type_callable_map

    def execute(self, time_range: TimeRange, global_variable_set: Dict,
                task: PlaybookMetricTaskDefinitionProto) -> PlaybookMetricTaskExecutionResult:
        pass
