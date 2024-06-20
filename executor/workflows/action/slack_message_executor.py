import logging
import os

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.slack_api_processor import SlackApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_actions.slack_message_pb2 import SlackMessageWorkflowAction
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class SlackMessageExecutor(WorkflowActionExecutor):

    def __init__(self):
        self.source = Source.SLACK
        self.type = WorkflowAction.Type.SLACK_MESSAGE

    def get_action_connector_processor(self, slack_connector: ConnectorProto, **kwargs):
        if not slack_connector:
            db_connector = get_db_connectors(connector_type=Source.SLACK, is_active=True)
            if not db_connector:
                raise ValueError('Slack connector is not configured')
            db_connector = db_connector.first()
            slack_connector = db_connector.unmasked_proto

        generated_credentials = generate_credentials_dict(slack_connector.type, slack_connector.keys)
        return SlackApiProcessor(**generated_credentials)

    def execute(self, action: WorkflowAction, execution_output: [InterpretationProto],
                connector: ConnectorProto = None):
        slack_config: SlackMessageWorkflowAction = action.slack_message
        channel_id = slack_config.slack_channel_id.value
        if not channel_id:
            raise ValueError('Slack channel id is not configured in the notification config')
        logger.info(f"Sending slack message  to channel {channel_id}")
        blocks = []
        file_uploads = []
        for i, interpretation in enumerate(execution_output):
            if i==0 and interpretation.type == InterpretationProto.Type.SUMMARY:
                title = f'Hello team, here is snapshot of playbook <{interpretation.description.value}|{interpretation.title.value}> ' \
                f'that is configured for this alert'
            else:
                title = f'{interpretation.title.value}'
            description = interpretation.description.value
            summary = interpretation.summary.value
            block_text = title
            if description:
                block_text += f'\n{description}'
            if summary:
                block_text += f'\n{summary}'
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": block_text
                }
            })
            if interpretation.type == InterpretationProto.Type.IMAGE:
                blocks.append({
                    "type": "image",
                    "image_url": interpretation.image_url.value,
                    "alt_text": 'metric evaluation'
                })
            elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                file_uploads.append({'channel_id': channel_id, 'file_path': interpretation.file_path.value,
                                     'initial_comment': interpretation.title.value})
        message_params = {'blocks': blocks, 'channel_id': channel_id}
        try:
            slack_api_processor = self.get_action_connector_processor(connector)
            slack_api_processor.send_bot_message(**message_params)
            for file_upload in file_uploads:
                try:
                    slack_api_processor.files_upload(**file_upload)
                    os.remove(file_upload['file_path'])
                except Exception as e:
                    logger.error(f"Error uploading file to slack: {e}")
                    continue
            return True
        except Exception as e:
            logger.error(f"Error sending slack message: {e}")
            raise e
