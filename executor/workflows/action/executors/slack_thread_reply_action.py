import logging
import os

from accounts.models import Account
from connectors.crud.connectors_crud import get_db_account_connectors
from executor.workflows.action.action_executor import WorkflowActionExecutor
from integrations_api_processors.slack_api_processor import SlackApiProcessor
from protos.base_pb2 import SourceKeyType
from protos.connectors.connector_pb2 import Connector
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation
from protos.playbooks.workflow_actions.slack_thread_reply_action_pb2 import SlackThreadReply
from protos.playbooks.workflow_v2_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class SlackThreadReplyExecutor(WorkflowActionExecutor):

    def execute(self, account: Account, action: WorkflowAction, execution_output: [Interpretation]):
        slack_message_notify: SlackThreadReply = action.slack_thread_reply
        connector_id = slack_message_notify.slack_connector_id.value
        channel_id = slack_message_notify.slack_channel_id.value
        thread_ts = slack_message_notify.thread_ts.value
        if not connector_id or not channel_id or not thread_ts:
            raise ValueError(
                'Slack connector id, slack channel id and thread_ts are required for slack thread reply action')
        db_connector = get_db_account_connectors(account, connector_id=connector_id)
        if not db_connector:
            raise ValueError(f"Slack connector with id {connector_id} not found")
        connector: Connector = db_connector.first().unmasked_proto
        slack_token = None
        for key in connector.keys:
            if key.key_type == SourceKeyType.SLACK_BOT_AUTH_TOKEN:
                slack_token = key.key.value
                break
        if not slack_token:
            raise ValueError(f"Slack bot auth token not found for connector {connector_id}")
        logger.info(f"Sending slack message to channel {channel_id} for connector {connector.id.value}")
        blocks = []
        file_uploads = []
        for i, interpretation in enumerate(execution_output):
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
            if interpretation.type == Interpretation.Type.IMAGE:
                blocks.append({
                    "type": "image",
                    "image_url": interpretation.image_url.value,
                    "alt_text": 'metric evaluation'
                })
            elif interpretation.type == Interpretation.Type.CSV_FILE:
                file_uploads.append({'channel_id': channel_id, 'file_path': interpretation.file_path.value,
                                     'initial_comment': interpretation.title.value})
        message_params = {'blocks': blocks, 'channel_id': channel_id, 'reply_to': thread_ts}
        for file_upload in file_uploads:
            file_upload['thread_ts'] = thread_ts
        try:
            slack_api_processor = SlackApiProcessor(slack_token)
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
