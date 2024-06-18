from typing import Dict

from google.protobuf.wrappers_pb2 import StringValue

from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.remote_server_processor import RemoteServerProcessor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, BashCommandOutputResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.bash_task_pb2 import Bash


class BashSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.BASH
        self.task_proto = Bash
        self.task_type_callable_map = {
            Bash.TaskType.COMMAND: {
                'task_type': 'COMMAND',
                'executor': self.execute_command,
                'model_types': [SourceModelType.SSH_SERVER],
                'result_type': PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                'display_name': 'Execute a BASH Command',
                'category': 'Actions'
            },
        }

    def get_active_connectors(self, account_id, connector_id: int = None) -> [ConnectorProto]:
        db_connectors = get_db_connectors(account_id=account_id, connector_type=Source.REMOTE_SERVER, is_active=True)
        if connector_id:
            db_connectors = db_connectors.filter(id=connector_id)
        connector_protos: [ConnectorProto] = []
        for dbc in db_connectors:
            if self.validate_connector(dbc.unmasked_proto):
                connector_protos.append(dbc.unmasked_proto)
        return connector_protos

    def get_connector_processor(self, remote_server_connector, **kwargs):
        generated_credentials = {}
        if remote_server_connector:
            generated_credentials = generate_credentials_dict(remote_server_connector.type,
                                                              remote_server_connector.keys)
        return RemoteServerProcessor(**generated_credentials)

    def execute_command(self, time_range: TimeRange, global_variable_set: Dict, bash_task: Bash,
                        remote_server_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            bash_command: Bash = bash_task.command
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
            for key, value in global_variable_set.items():
                updated_commands = []
                for command in commands:
                    command = command.replace(f"{{{key}}}", value)
                    updated_commands.append(command)
                commands = updated_commands
            try:
                outputs = {}
                ssh_client = self.get_connector_processor(remote_server_connector)
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
