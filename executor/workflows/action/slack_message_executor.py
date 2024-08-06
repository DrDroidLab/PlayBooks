import logging
import tempfile

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.slack_api_processor import SlackApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from media.models import TextFile, CSVFile
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
        temp_files = []
        text_message = ""
        step_number = 0
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
                step_number += 1
                blocks.extend(
                    [{
                        "type": "header",
                        "text":
                            {
                                "type": "plain_text",
                                "text": f"{step_number}. {title}"
                            }
                    }])
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
                if interpretation.type == InterpretationProto.Type.TEXT:
                    blocks.extend(
                        [{
                            "type": "section",
                            "text":
                                {
                                    "type": "mrkdwn",
                                    "text": f'{description} \n (File attached separately)'
                                }
                        }])
                    object_uid = interpretation.object_uid.value
                    text_content = TextFile.objects.get(uuid=object_uid).fetch_text_from_blob()
                    temp_file = tempfile.NamedTemporaryFile(suffix='.md', mode='w+')
                    text_filename = temp_file.name
                    with open(text_filename, 'w') as text_file:
                        text_file.write(text_content)
                    temp_files.append(temp_file)
                    file_uploads.append({'channel_id': channel_id, 'file_path': text_filename,
                                         'title': title, 'initial_comment': f'Data for {step_number}.{description}'})
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
                    object_uid = interpretation.object_uid.value
                    temp_file = tempfile.NamedTemporaryFile(suffix='.csv', mode='w+')
                    csv_filename = temp_file.name
                    CSVFile.objects.get(uuid=object_uid).fetch_csv_from_blob(write=True, output_path=csv_filename)
                    temp_files.append(temp_file)
                    file_uploads.append({'channel_id': channel_id, 'file_path': csv_filename,
                                         'title': title, 'initial_comment': f'Data for {step_number}.{description}'})
                elif interpretation.type == InterpretationProto.Type.JSON:
                    blocks.extend(
                        [{
                            "type": "section",
                            "text":
                                {
                                    "type": "mrkdwn",
                                    "text": f'{description} \n (File attached separately)'
                                }
                        }])
                    object_uid = interpretation.object_uid.value
                    text_content = TextFile.objects.get(uuid=object_uid).fetch_text_from_blob()
                    temp_file = tempfile.NamedTemporaryFile(suffix='.md', mode='w+')
                    text_filename = temp_file.name
                    with open(text_filename, 'w') as text_file:
                        text_file.write(text_content)
                    temp_files.append(temp_file)
                    file_uploads.append({'channel_id': channel_id, 'file_path': text_filename,
                                         'title': title, 'initial_comment': f'Data for {step_number}.{description}'})
        message_params = {'blocks': blocks, 'channel_id': channel_id, 'text_message': text_message}
        try:
            slack_api_processor = self.get_action_connector_processor(connector)
            slack_api_processor.send_bot_message(**message_params)
            for file_upload in file_uploads:
                try:
                    slack_api_processor.files_upload(**file_upload)
                except Exception as e:
                    logger.error(f"Error uploading file to slack: {e}")
                    continue
            for temp_file in temp_files:
                try:
                    temp_file.close()
                except Exception as e:
                    logger.error(f"Error closing temp file: {e}")
                    continue
            return True
        except Exception as e:
            logger.error(f"Error sending slack message: {e}")
            raise e
