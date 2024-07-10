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
            if(interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION):
                if title:
                    blocks.extend([
                        {
                            "type": "header",
                            "text": 
                            {
                                "type": "plain_text",
                                "text": f'{title}'
                            }
                        }])
                if block_message:
                    blocks.extend([
                        {
                            "type": "section",
                            "text": 
                            {
                                "type": "mrkdwn",
                                "text": f'{block_message}'
                            }
                        }])
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
                blocks.extend(
                    [{
                        "type": "header",
                        "text": 
                        {
                            "type": "plain_text",
                            "text": f"{step_number}. {title}"
                        }
                    }])
                step_number += 1
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
                if interpretation.type == InterpretationProto.Type.TEXT:
                    blocks.extend(
                        [{
                            "type": "section",
                            "text": 
                            {
                                "type": "mrkdwn",
                                "text": f'{block_message}'
                            }                
                        }])
                    text_message = text_message + f"{title} {description} \n{summary}"
                elif interpretation.type == InterpretationProto.Type.IMAGE:
                    blocks.extend([
                        {
                            "type": "section",
                            "text": 
                            {
                                "type": "mrkdwn",
                                "text": f'{description}'
                            }                
                        },
                        {
                            "type": "image",
                            "image_url": interpretation.image_url.value,
                            "alt_text": f'{description}'
                        }])
                elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                    blocks.extend(
                        [{
                            "type": "section",
                            "text": 
                            {
                                "type": "mrkdwn",
                                "text": f'{description} \n (File attached separately)'
                            }                
                        }])
                    file_uploads.append({'channel_id': channel_id, 'file_path': interpretation.file_path.value,
                                        'title': title,'initial_comment': f'Data for {step_number}.{description}'})
                elif interpretation.type == InterpretationProto.Type.JSON:
                    blocks.extend(
                        [{
                            "type": "section",
                            "text": 
                            {
                                "type": "mrkdwn",
                                "text": f"```{summary}```"
                            }
                        }])
        message_params = {'blocks': blocks, 'channel_id': channel_id, 'text_message': text_message}
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