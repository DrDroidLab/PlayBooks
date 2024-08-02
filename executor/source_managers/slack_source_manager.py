import logging
import os

from google.protobuf.wrappers_pb2 import StringValue, Int64Value

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.slack_api_processor import SlackApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.literal_pb2 import LiteralType, Literal
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType
from protos.playbooks.source_task_definitions.slack_task_pb2 import Slack
from protos.ui_definition_pb2 import FormField, FormFieldType
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


class SlackSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.SLACK
        self.task_proto = Slack
        self.task_type_callable_map = {
            Slack.TaskType.SEND_MESSAGE: {
                'executor': self.execute_send_message,
                'model_types': [SourceModelType.SLACK_CHANNEL],
                'result_type': PlaybookTaskResultType.TEXT,
                'display_name': 'Send a message to slack channel',
                'category': 'Actions',
                'form_fields': [
                    FormField(key_name=StringValue(value="channel"),
                              display_name=StringValue(value="Channel"),
                              description=StringValue(value="Select Slack Channel"),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT_FT),
                    FormField(key_name=StringValue(value="text"),
                              display_name=StringValue(value="Message"),
                              description=StringValue(value='Enter Message'),
                              data_type=LiteralType.STRING,
                              form_field_type=FormFieldType.TEXT_FT),
                ]
            },
            # SlackTaskProto.TaskType.SEND_THREAD_REPLY: {
            #     'executor': self.execute_send_thread_reply,
            #     'model_types': [SourceModelType.SLACK_CHANNEL],
            #     'result_type': PlaybookTaskResultType.TEXT,
            #     'display_name': 'Send a reply to a thread in slack channel',
            #     'category': 'Actions'
            # },
        }

    def get_connector_processor(self, grafana_connector, **kwargs):
        generated_credentials = generate_credentials_dict(grafana_connector.type, grafana_connector.keys)
        return SlackApiProcessor(**generated_credentials)

    def execute_send_message(self, time_range: TimeRange, slack_task: Slack,
                             slack_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not slack_connector:
                raise Exception("Task execution Failed:: No Postgres source found")

            send_message_task: Slack.SendMessage = slack_task.send_message
            channel = send_message_task.channel.value
            text = send_message_task.text.value
            blocks = proto_to_dict(send_message_task.blocks)
            file_uploads = proto_to_dict(send_message_task.file_uploads)
            if not channel:
                raise Exception("Task execution Failed:: No Slack channel found")

            slack_api_processor = self.get_connector_processor(slack_connector)
            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Channel -> {}".format("Slack",
                                                                                                      slack_connector.account_id.value,
                                                                                                      channel),
                  flush=True)

            if blocks:
                message_params = {'blocks': blocks, 'channel_id': channel}
            elif text:
                message_params = {'text_message': text, 'channel_id': channel}
            else:
                raise ValueError("No message content found")

            slack_api_processor.send_bot_message(**message_params)
            for file_upload in file_uploads:
                try:
                    file_upload['channel_id'] = channel
                    slack_api_processor.files_upload(**file_upload)
                    os.remove(file_upload['file_path'])
                except Exception as e:
                    logger.error(f"Error uploading file to slack: {e}")
                    continue
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TEXT)
        except Exception as e:
            raise Exception(f"Error while executing Postgres task: {e}")

    def execute_send_thread_reply(self, time_range: TimeRange, slack_task: Slack,
                                  slack_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not slack_connector:
                raise Exception("Task execution Failed:: No Postgres source found")

            send_message_task: Slack.SendThreadReply = slack_task.send_message
            channel = send_message_task.channel.value
            thread_ts = send_message_task.thread_ts.value
            text = send_message_task.text.value
            blocks = proto_to_dict(send_message_task.blocks)
            file_uploads = proto_to_dict(send_message_task.file_uploads)
            if not channel or not thread_ts:
                raise Exception("Task execution Failed:: No Slack channel or thread_ts found")

            slack_api_processor = self.get_connector_processor(slack_connector)
            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Channel -> {}".format("Slack",
                                                                                                      slack_connector.account_id.value,
                                                                                                      channel),
                  flush=True)

            if blocks:
                message_params = {'blocks': blocks, 'channel_id': channel, 'reply_to': thread_ts}
            elif text:
                message_params = {'text_message': text, 'channel_id': channel}
            else:
                raise ValueError("No message content found")

            slack_api_processor.send_bot_message(**message_params)
            for file_upload in file_uploads:
                try:
                    file_upload['channel_id'] = channel
                    file_upload['thread_ts'] = thread_ts
                    slack_api_processor.files_upload(**file_upload)
                    os.remove(file_upload['file_path'])
                except Exception as e:
                    logger.error(f"Error uploading file to slack: {e}")
                    continue
            return PlaybookTaskResult(source=self.source, type=PlaybookTaskResultType.TEXT)
        except Exception as e:
            raise Exception(f"Error while executing Postgres task: {e}")
