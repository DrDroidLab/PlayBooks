from google.protobuf.wrappers_pb2 import StringValue

from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.bash_processor import BashProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, BashCommandOutputResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.bash_task_pb2 import Bash
from protos.ui_definition_pb2 import FormField, FormFieldType


class BashSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.BASH
        self.task_proto = Bash
        self.task_type_callable_map = {
            Bash.TaskType.COMMAND: {
                'executor': self.execute_command,
                'model_types': [SourceModelType.SSH_SERVER],
                'result_type': PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                'display_name': 'Execute a BASH Command',
                'category': 'Actions',
                'form_fields': [
                    FormField(key_name=StringValue(value="remote_server"),
                              display_name=StringValue(value="Remote Server"),
                              description=StringValue(value='Select Remote Server'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TYPING_DROPDOWN_FT,
                              is_optional=True),
                    FormField(key_name=StringValue(value="command"),
                              display_name=StringValue(value="Command"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.MULTILINE_FT),
                ]
            },
        }

    def get_connector_processor(self, bash_connector, **kwargs):
        generated_credentials = {}
        if bash_connector:
            generated_credentials = generate_credentials_dict(bash_connector.type, bash_connector.keys)
        if 'remote_server_str' in kwargs:
            remote_server_str = kwargs.get('remote_server_str')
            generated_credentials['remote_host'] = remote_server_str
        return BashProcessor(**generated_credentials)

    def execute_command(self, time_range: TimeRange, bash_task: Bash,
                        remote_server_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            bash_command: Bash.Command = bash_task.command
            remote_server_str = bash_command.remote_server.value if bash_command.remote_server else None
            if remote_server_str and not remote_server_connector:
                ssh_server_asset = get_db_connector_metadata_models(model_type=SourceModelType.SSH_SERVER,
                                                                    model_uid=remote_server_str)
                if not ssh_server_asset:
                    raise Exception("No remote servers assets found")
                ssh_server_asset = ssh_server_asset.first()

                db_remote_server_connector = ssh_server_asset.connector
                remote_server_connector = db_remote_server_connector.unmasked_proto

            command_str = bash_command.command.value
            commands = command_str.split('\n')
            try:
                outputs = {}
                ssh_client = self.get_connector_processor(remote_server_connector, remote_server_str=remote_server_str)
                for command in commands:
                    command_to_execute = command
                    output = ssh_client.execute_command(command_to_execute)
                    outputs[command] = output

                command_output_protos = []
                for command, output in outputs.items():
                    bash_command_result = BashCommandOutputResult.CommandOutput(
                        command=StringValue(value=command),
                        output=StringValue(value=output)
                    )
                    command_output_protos.append(bash_command_result)

                return PlaybookTaskResult(
                    source=self.source,
                    type=PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                    bash_command_output=BashCommandOutputResult(
                        command_outputs=command_output_protos
                    )
                )
            except Exception as e:
                raise Exception(f"Error while executing Bash task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing Bash task: {e}")
