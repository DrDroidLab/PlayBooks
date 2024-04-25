import logging

from accounts.models import Account
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from executor.workflows.action.notify_action_executor.notifier import Notifier
from integrations_api_processors.slack_api_processor import SlackApiProcessor
from protos.connectors.connector_pb2 import ConnectorType, ConnectorKey
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_pb2 import WorkflowActionNotificationConfig as WorkflowActionNotificationConfigProto, \
    WorkflowActionSlackNotificationConfig as WorkflowActionSlackNotificationConfigProto

logger = logging.getLogger(__name__)


class SlackNotifier(Notifier):

    def __init__(self, account: Account):
        self.type = WorkflowActionNotificationConfigProto.NotificationType.SLACK
        self.account = account

        slack_connectors = get_db_connectors(account, connector_type=ConnectorType.SLACK, is_active=True)
        if not slack_connectors:
            raise ValueError('Slack connector is not configured for the account')
        slack_connector = slack_connectors.first()
        slack_bot_auth_token_keys = get_db_connector_keys(account, slack_connector.id,
                                                          ConnectorKey.KeyType.SLACK_BOT_AUTH_TOKEN)
        if not slack_bot_auth_token_keys:
            raise ValueError('Slack bot auth token is not configured for the account')

        slack_bot_auth_token = slack_bot_auth_token_keys.first()
        self.slack_api_processor = SlackApiProcessor(slack_bot_auth_token.value)

    def notify(self, config: WorkflowActionNotificationConfigProto, execution_output: [InterpretationProto]):
        slack_config: WorkflowActionSlackNotificationConfigProto = config.slack_config
        channel_id = slack_config.slack_channel_id.value
        if not channel_id:
            raise ValueError('Slack channel id is not configured in the notification config')
        logger.info(f"Sending slack message to channel {channel_id} for account {self.account.id}")
        blocks = []
        for i, interpretation in enumerate(execution_output):
            if interpretation.type == InterpretationProto.Type.SUMMARY:
                if interpretation.title.value.startswith('Hello team'):
                    blocks.append({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": interpretation.title.value
                        }
                    })
                else:
                    blocks.append({
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f'Step {i + 1}: {interpretation.title.value}'
                        }
                    })
            elif interpretation.type == InterpretationProto.Type.IMAGE:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f'Step {i + 1}: {interpretation.title.value}'
                    }
                })
                blocks.append({
                    "type": "image",
                    "image_url": interpretation.image_url.value,
                    "alt_text": 'metric evaluation'
                })
        message_params = {'blocks': blocks, 'channel_id': channel_id}
        if slack_config.message_type == WorkflowActionSlackNotificationConfigProto.MessageType.THREAD_REPLY:
            message_params['reply_to'] = slack_config.thread_ts.value
        try:
            self.slack_api_processor.send_bot_message(**message_params)
            return True
        except Exception as e:
            logger.error(f"Error sending slack message: {e}")
            raise e
