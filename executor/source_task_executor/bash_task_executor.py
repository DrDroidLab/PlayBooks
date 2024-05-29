import io
import subprocess
from typing import Dict

import paramiko
from google.protobuf.wrappers_pb2 import StringValue

from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from executor.playbook_task_executor import PlaybookTaskExecutor
from protos.base_pb2 import TimeRange, Source, SourceModelType
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, BashCommandOutputResult, PlaybookTaskResultType
from protos.playbooks.playbook_pb2 import PlaybookTask
from protos.playbooks.source_task_definitions.bash_task_pb2 import Bash


def reconstruct_rsa_key(key_string):
    key_string = key_string.replace('-----BEGIN RSA PRIVATE KEY-----', '').replace('-----END RSA PRIVATE KEY-----', '')

    # Remove any whitespace or line breaks
    key_string = ''.join(key_string.split())

    # Add line breaks to reconstruct the key
    reconstructed_key = '-----BEGIN RSA PRIVATE KEY-----\n'
    reconstructed_key += '\n'.join([key_string[i:i + 64] for i in range(0, len(key_string), 64)])
    reconstructed_key += '\n-----END RSA PRIVATE KEY-----'

    return reconstructed_key


def execute_bash_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                universal_newlines=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing command{command}: {e}")
        return f'Error executing command: {e}'


def execute_remote_command_using_pem(remote_host, remote_user, ssh_key_content, command):
    # Create a file-like object from the key content
    ssh_key_content = reconstruct_rsa_key(ssh_key_content)
    key_file = io.StringIO(ssh_key_content)

    # Create an SSH client instance
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        # Load the private key from string
        key = paramiko.RSAKey.from_private_key(key_file)

        # Connect to the remote host
        client.connect(hostname=remote_host, username=remote_user, pkey=key)

        # Execute the command
        stdin, stdout, stderr = client.exec_command(command)

        # Read and return the output
        output = stdout.read().decode('utf-8')
        return output.strip()
    except paramiko.AuthenticationException as e:
        return f"Authentication error: {str(e)}"
    except paramiko.SSHException as e:
        return f"SSH connection error: {str(e)}"
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        # Close the SSH connection
        client.close()


def execute_remote_command_using_password(remote_host, remote_user, password, command):
    # Create an SSH client instance
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        # Connect to the remote host using password authentication
        client.connect(hostname=remote_host, username=remote_user, password=password)

        # Execute the command
        stdin, stdout, stderr = client.exec_command(command)

        # Read and return the output
        output = stdout.read().decode('utf-8')
        return output.strip()
    except paramiko.AuthenticationException as e:
        return f"Authentication error: {str(e)}"
    except paramiko.SSHException as e:
        return f"SSH connection error: {str(e)}"
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        # Close the SSH connection
        client.close()


class BashTaskExecutor(PlaybookTaskExecutor):

    def __init__(self, account_id):
        self.source = Source.BASH
        self.__account_id = account_id
        self.task_type_callable_map = {
            Bash.TaskType.COMMAND: self.execute_command,
        }

    def execute(self, time_range: TimeRange, global_variable_set: Dict, task: PlaybookTask) -> PlaybookTaskResult:
        bash_task: Bash = task.bash
        task_type = bash_task.type
        task_callable = self.task_type_callable_map.get(task_type)
        if task_callable:
            return task_callable(time_range, global_variable_set, bash_task)
        else:
            raise Exception(f"Unsupported task type: {task_type}")

    def execute_command(self, time_range: TimeRange, global_variable_set: Dict, bash_task: Bash) -> PlaybookTaskResult:
        try:
            command: Bash = bash_task.command
            remote_server_str = command.remote_server.value
            pem_key = None
            password = None
            if remote_server_str:
                ssh_server_asset = get_db_connector_metadata_models(self.__account_id,
                                                                    model_type=SourceModelType.SSH_SERVER,
                                                                    model_uid=remote_server_str)
                if not ssh_server_asset:
                    raise Exception("No remote servers assets found")
                ssh_server_asset = ssh_server_asset.first()
                metadata = ssh_server_asset.metadata
                if metadata:
                    if 'pem' in metadata:
                        pem_key = metadata['pem']
                    elif 'password' in metadata:
                        password = metadata['password']
            command_str = command.command.value
            commands = command_str.split('\n')
            for key, value in global_variable_set.items():
                updated_commands = []
                for command in commands:
                    command = command.replace(f"{{{key}}}", value)
                    updated_commands.append(command)
                commands = updated_commands
            try:
                outputs = {}
                for command in commands:
                    command_to_execute = command
                    if pem_key:
                        remote_user = remote_server_str.split('@')[0]
                        remote_host = remote_server_str.split('@')[1]
                        output = execute_remote_command_using_pem(remote_host, remote_user, pem_key, command_to_execute)
                    elif password:
                        remote_user = remote_server_str.split('@')[0]
                        remote_host = remote_server_str.split('@')[1]
                        output = execute_remote_command_using_password(remote_host, remote_user, password,
                                                                       command_to_execute)
                    elif not remote_server_str:
                        output = execute_bash_command(command_to_execute)
                    else:
                        raise Exception("No valid remote server credentials found")
                    outputs[command] = output
                command_outputs = []
                for command, output in outputs.items():
                    bash_command_result = BashCommandOutputResult.CommandOutput(
                        command=StringValue(value=command),
                        output=StringValue(value=output)
                    )
                    command_outputs.append(bash_command_result)

                return PlaybookTaskResult(
                    source=self.source,
                    type=PlaybookTaskResultType.BASH_COMMAND_OUTPUT,
                    bash_command_output=BashCommandOutputResult(
                        command_outputs=command_outputs
                    )
                )
            except Exception as e:
                raise Exception(f"Error while executing API call task: {e}")
        except Exception as e:
            raise Exception(f"Error while executing API call task: {e}")
