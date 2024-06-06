from typing import Dict

from executor.playbook_source_manager import PlaybookSourceManager
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.source_task_definitions.documentation_task_pb2 import Documentation


class DocumentationSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.DOCUMENTATION
        self.task_proto = Documentation
        self.task_type_callable_map = {
            Documentation.TaskType.MARKDOWN: {
                'task_type': 'MARKDOWN',
                'executor': self.execute_markdown,
                'model_types': [],
                'display_name': 'Write Markdown Documentation',
                'category': 'Documentation'
            },
            Documentation.TaskType.IFRAME: {
                'task_type': 'IFRAME',
                'executor': self.execute_iframe,
                'model_types': [],
                'display_name': 'Embed an IFrame',
                'category': 'Documentation'
            },
        }

    def execute_markdown(self, time_range: TimeRange, global_variable_set: Dict,
                         doc_task: Documentation, doc_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            return PlaybookTaskResult(source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")

    def execute_iframe(self, time_range: TimeRange, global_variable_set: Dict,
                       doc_task: Documentation, doc_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            return PlaybookTaskResult(source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")
