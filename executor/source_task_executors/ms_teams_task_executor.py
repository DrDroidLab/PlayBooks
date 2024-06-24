import logging
import os
from typing import Dict

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.ms_teams_api_processor import MSTeamsApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult, PlaybookTaskResultType

from protos.playbooks.source_task_definitions.ms_teams_task_pb2 import MSTeams
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


class MSTeamsSourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.MS_TEAMS
        self.task_proto = MSTeams
        self.task_type_callable_map = {
            MSTeams.TaskType.SEND_MESSAGE_WEBHOOK: {
                'executor': self.execute_send_message_webhook,
                'model_types': [SourceModelType.MS_TEAMS_CHANNEL],
                'result_type': PlaybookTaskResultType.UNKNOWN,
                'display_name': 'Send a message to MSTeams channel using Webhook',
                'category': 'Actions',
            },
        }

    def get_connector_processor(self, MSTeams_connector, **kwargs):
        generated_credentials = generate_credentials_dict(MSTeams_connector.type, MSTeams_connector.keys)
        return MSTeamsApiProcessor(**generated_credentials)

    def execute_send_message_webhook(self, time_range: TimeRange, global_variable_set: Dict,
                                     msteams_task: MSTeams,
                                     ms_teams_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not ms_teams_connector:
                raise Exception("Task execution Failed:: No MSTeams Webhook source found")

            send_message_webhook_task: MSTeams.SendMessageWebhook = msteams_task.send_message_webhook
            webhook = send_message_webhook_task.webhook.value
            payload = proto_to_dict(send_message_webhook_task.payload)
            if not webhook:
                raise Exception("Task execution Failed:: No MSTeams webhook found")

            ms_teams_api_processor = self.get_connector_processor(ms_teams_connector)
            print("Playbook Task Downstream Request: Type -> {}, Webhook -> {}".format("MSTeams", webhook),
                  flush=True)
            if payload:
                message_params = {'payload': payload}
            else:
                raise ValueError("No message content found")
            ms_teams_api_processor.send_webhook_message(**message_params)
            return PlaybookTaskResult(source=self.source)
        except Exception as e:
            raise Exception(f"Error while executing MSTeams task: {e}")
