import logging

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.rootly_api_processor import RootlyApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_actions.rootly_timeline_events_pb2 import RootlyTimelineEventsWorkflowAction
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class RootlyTimelineEventsExecutor(WorkflowActionExecutor):

    def __init__(self):
        self.source = Source.PAGER_DUTY
        self.type = WorkflowAction.Type.PAGERDUTY_NOTES

    def get_action_connector_processor(self, rootly_connector: ConnectorProto, **kwargs):
        if not rootly_connector:
            db_connector = get_db_connectors(connector_type=Source.ROOTLY, is_active=True)
            if not db_connector:
                raise ValueError('Active Rootly connector is not configured')
            db_connector = db_connector.first()
            rootly_connector = db_connector.unmasked_proto

        generated_credentials = generate_credentials_dict(rootly_connector.type, rootly_connector.keys)
        return RootlyApiProcessor(**generated_credentials)

    def execute(self, action: WorkflowAction, execution_output: [InterpretationProto], # type: ignore
                connector: ConnectorProto = None):
        rootly_config: RootlyTimelineEventsWorkflowAction = action.rootly_timeline_events
        incident_id = rootly_config.incident_id.value
        if not incident_id:
            raise ValueError('Rootly incident id is not configured in the notification config')
        logger.info(f"Sending timeline event to incident {incident_id}")
        content_list = []
        for i, interpretation in enumerate(execution_output):
            title = interpretation.title.value
            description = interpretation.description.value
            summary = interpretation.summary.value
            block_message = ""
            text_message = ""

            if description:
                block_message += f"{description}\n"
            if summary:
                block_message += f"{summary}\n"
            text_message = text_message + block_message

            if interpretation.model_type == InterpretationProto.ModelType.WORKFLOW_EXECUTION:
                if title:
                    content_list.append(f"{title}")
                if block_message:
                    content_list.append(f"{block_message}")
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_STEP:
                step_number = i + 1  # Ensure step_number is defined
                content_list.append(f"{step_number}. {title}")
            elif interpretation.model_type == InterpretationProto.ModelType.PLAYBOOK_TASK:
                if interpretation.type == InterpretationProto.Type.TEXT:
                    content_list.append(f"{block_message}")
                elif interpretation.type == InterpretationProto.Type.IMAGE:
                    content_list.append(f'{title} \n {block_message} \n {interpretation.object_url.value}')
                elif interpretation.type == InterpretationProto.Type.CSV_FILE:
                    content_list.append(f'{title} \n {block_message} \n {interpretation.file_path.value}')
                elif interpretation.type == InterpretationProto.Type.JSON:
                    content_list.append(f"```{summary}```")

            # Join the content list into a single string
            content = "\n".join(content_list)

            note_params = {'incident_id': incident_id, 'content': content}
            try:
                rootly_api_processor = self.get_action_connector_processor(connector)
                rootly_api_processor.create_timeline_event(**note_params)
            except Exception as e:
                logger.error(f"Error creating timeline events for incident: {incident_id}, Error:{e}")
                raise e
