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
        playbook_name = ""
        playbook_url = ""
        for i, interpretation in enumerate(execution_output):
            if i == 0 and interpretation.type == InterpretationProto.Type.SUMMARY:
                playbook_url = interpretation.description.value
                playbook_name = interpretation.title.value
                body_block = [{
                    "type": "TextBlock",
                    "text": f"Hello team, here's the executed version of [{playbook_name}]({playbook_url}) that's configured in the Workflow triggered.",
                    "size": "large",
                    "wrap": True,
                    "style": "heading"
                }]
            else:
                step_execution = interpretation.title.value
                interpretation_explainer = interpretation.description.value
                interpretation_result = interpretation.summary.value
                if interpretation.type == InterpretationProto.Type.IMAGE:
                    body_block = [
                        {
                            "type": "TextBlock",
                            "text": step_execution + "\n" + interpretation_result + "\n" + interpretation_explainer,
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        },
                        {
                            "type": "Image",
                            "url": interpretation.image_url.value,
                            "altText": step_execution
                        }
                    ]
                elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                    body_block = [
                        {
                            "type": "TextBlock",
                            "text": step_execution + "\n" + interpretation_result + "\n" + interpretation_explainer,
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        },
                        {
                            "type": "Image",
                            "url": interpretation.object_url.value,
                            "altText": step_execution
                        }
                    ]
                else:
                    body_block = [
                        {
                            "type": "TextBlock",
                            "text": step_execution + "\n" + interpretation_result + "\n" + interpretation_explainer,
                            "size": "medium",
                            "wrap": True,
                            "weight": "lighter"
                        }
                    ]
            blocks.extend(body_block)
        payload = {"type": "message", "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive",
                                                       "content": {"type": "AdaptiveCard", "version": "1.2",
                                                                   "body": blocks, "actions": [
                                                               {"type": "Action.OpenUrl",
                                                                "title": f"View Current Execution for {playbook_name}",
                                                                "url": f"{playbook_url}"}]}}]}
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
