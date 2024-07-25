from google.protobuf.wrappers_pb2 import StringValue
from executor.playbook_source_manager import PlaybookSourceManager
from protos.base_pb2 import Source, TimeRange
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType, TextResult
from protos.playbooks.source_task_definitions.documentation_task_pb2 import Documentation
from protos.ui_definition_pb2 import FormField, FormFieldType


class DocumentationSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.DOCUMENTATION
        self.task_proto = Documentation
        self.task_type_callable_map = {
            Documentation.TaskType.MARKDOWN: {
                'executor': self.execute_markdown,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TEXT,
                'display_name': 'Write Markdown Documentation',
                'category': 'Documentation',
                'form_fields': [
                    FormField(key_name=StringValue(value="content"),
                              display_name=StringValue(value="Content"),
                              description=StringValue(value='Please enter Markdown text'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.WYSIWYG),
                ]
            },
            Documentation.TaskType.IFRAME: {
                'executor': self.execute_iframe,
                'model_types': [],
                'result_type': PlaybookTaskResultType.TEXT,
                'display_name': 'Embed an IFrame',
                'category': 'Documentation',
                'form_fields': [
                    FormField(key_name=StringValue(value="iframe_url"),
                              display_name=StringValue(value="IFrame URL"),
                              description=StringValue(value='Enter IFrame URL'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT),
                    FormField(key_name=StringValue(value=""),
                              display_name=StringValue(value="IFrame Render"),
                              form_field_type=FormFieldType.IFRAME_RENDER),
                ]
            },
        }

    def execute_markdown(self, time_range: TimeRange, doc_task: Documentation,
                         doc_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            content_output = TextResult()
            if doc_task.type == Documentation.TaskType.MARKDOWN:
                content_output = TextResult(output=StringValue(value=doc_task.markdown.content.value))
            return PlaybookTaskResult(type=PlaybookTaskResultType.TEXT, source=self.source, text=content_output)
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")

    def execute_iframe(self, time_range: TimeRange, doc_task: Documentation,
                       doc_connector_proto: ConnectorProto) -> PlaybookTaskResult:
        try:
            content_output = TextResult()
            if doc_task.type == Documentation.TaskType.IFRAME:
                url = doc_task.iframe.iframe_url.value
                content_output = TextResult(output=StringValue(value=f"URL: {url}"))
            return PlaybookTaskResult(type=PlaybookTaskResultType.TEXT, source=self.source, text=content_output)
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")
