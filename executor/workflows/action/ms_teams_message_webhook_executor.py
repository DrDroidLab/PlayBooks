import logging
import os

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.ms_teams_api_processor import MSTeamsApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_actions.ms_teams_message_webhook_pb2 import MSTeamsMessageWebhookWorkflowAction
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class MSTeamsMessageWebhookExecutor(WorkflowActionExecutor):

    def __init__(self):
        self.source = Source.MS_TEAMS
        self.type = WorkflowAction.Type.MS_TEAMS_MESSAGE_WEBHOOK

    def get_action_connector_processor(self, ms_teams_connector: ConnectorProto, **kwargs):
        if not ms_teams_connector:
            db_connector = get_db_connectors(connector_type=Source.MS_TEAMS, is_active=True)
            if not db_connector:
                raise ValueError('Active MS Teams connector is not configured')
            db_connector = db_connector.first()
            ms_teams_connector = db_connector.unmasked_proto

        generated_credentials = generate_credentials_dict(ms_teams_connector.type, ms_teams_connector.keys)
        return MSTeamsApiProcessor(**generated_credentials)

    def execute(self, action: WorkflowAction, execution_output: [InterpretationProto],
                connector: ConnectorProto = None):
        ms_teams_config: MSTeamsMessageWebhookWorkflowAction = action.ms_teams_message_webhook
        webhook_url = ms_teams_config.ms_teams_connector_webhook_url.value
        if not webhook_url:
            raise ValueError('MS Teams Webhook is not configured in the notification config')
        logger.info(f"Sending MS Teams message  to webhook {webhook_url}")
        blocks = []
        text_message = ""
        step_number = 1
        for i, interpretation in enumerate(execution_output):
            title = interpretation.title.value
            description = interpretation.description.value
            summary = interpretation.summary.value
            block_message = ""
            if description:
                block_message += f"{description}\n"
            if summary:
                block_message += f"{summary}\n"
            text_message = text_message + block_message
            if interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION:
                if title:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f"{title}",
                            "size": "large",
                            "wrap": True,
                            "style": "heading"
                        }])
                if block_message:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f"{description} \n {summary}",
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        }])
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
                blocks.extend([
                    {
                        "type": "TextBlock",
                        "text": f"{step_number}. {title}",
                        "size": "large",
                        "wrap": True,
                        "style": "heading"
                    }])
                step_number += 1
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
                if interpretation.type == InterpretationProto.Type.TEXT:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f'{description}',
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        },
                        {
                            "type": "TextBlock",
                            "text": f"Here's the [{'md file'}]({interpretation.object_url.value}).",
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        }
                    ])
                elif interpretation.type == InterpretationProto.Type.IMAGE:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f'{description}',
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        },
                        {
                            "type": "Image",
                            "url": interpretation.image_url.value,
                            "altText": f'{description}'
                        }
                    ])
                elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f'{description}',
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        },
                        {
                            "type": "TextBlock",
                            "text": f"Here's the [{'csv file'}]({interpretation.object_url.value}).",
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        }
                    ])
                elif interpretation.type == InterpretationProto.Type.JSON:
                    blocks.extend([
                        {
                            "type": "TextBlock",
                            "text": f"```\n{description}\n```",
                            "size": "Medium",
                            "wrap": True,
                            "fontType": "Monospace"
                        },
                        {
                            "type": "TextBlock",
                            "text": f"Here's the [{'md file'}]({interpretation.object_url.value}).",
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        }
                    ])
        payload = {"type": "message", "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive",
                                                       "content": {"type": "AdaptiveCard", "version": "1.2",
                                                                   "body": blocks}}]}
        message_params = {'payload': payload}
        try:
            if webhook_url:
                ms_teams_api_processor = MSTeamsApiProcessor(webhook_url=webhook_url)
            else:
                ms_teams_api_processor = self.get_action_connector_processor(connector)
            ms_teams_api_processor.send_webhook_message(**message_params)
            return True
        except Exception as e:
            logger.error(f"Error sending MSTeams message: {e}")
            raise e
