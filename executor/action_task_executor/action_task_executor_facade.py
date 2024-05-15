from typing import Dict

from executor.action_task_executor.action_task_executor import PlaybookActionTaskExecutor
from executor.action_task_executor.api_action_task_executor import ApiActionTaskExecutor
from executor.action_task_executor.bash_command_action_task_executor import BashCommandActionTaskExecutor
from protos.base_pb2 import Source
from protos.playbooks.playbook_pb2 import PlaybookActionTaskDefinition as PlaybookActionTaskDefinitionProto, \
    PlaybookActionTaskExecutionResult as PlaybookActionTaskExecutionResultProto

action_source_display_name_mapping = {
    Source.UNKNOWN: "Unknown",
    Source.API: "Api Call",
    Source.BASH: "Bash Command",
}


class PlaybookActionTaskExecutorFacade:

    def __init__(self):
        self._map = {}

    def register(self, action_type: Source, executor: PlaybookActionTaskExecutor.__class__):
        self._map[action_type] = executor

    def execute_action_task(self, account_id, global_variable_set: Dict,
                            action_task: PlaybookActionTaskDefinitionProto) -> PlaybookActionTaskExecutionResultProto:
        source = action_task.source
        if source not in self._map:
            raise ValueError(
                f'No executor found for action type: {str(action_source_display_name_mapping.get(source, source))}')
        executor = self._map[source](account_id)
        try:
            return executor.execute(global_variable_set, action_task)
        except Exception as e:
            raise Exception(f"Action Task Failed:: {e}")


action_task_executor = PlaybookActionTaskExecutorFacade()
action_task_executor.register(Source.API, ApiActionTaskExecutor)
action_task_executor.register(Source.BASH, BashCommandActionTaskExecutor)
