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
                'display_name': 'Write Markdown Documentation',
                'category': 'Documentation',
                'task_type': 'MARKDOWN',
                'model_types': [],
                'executor': self.execute_markdown
            },
        }

    def execute_markdown(self, time_range: TimeRange, global_variable_set: Dict,
                         doc_task: Documentation, doc_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            return PlaybookTaskResult(source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")