import logging

from connectors.crud.connectors_crud import get_db_connectors
from connectors.utils import generate_credentials_dict
from executor.source_processors.pd_api_processor import PdApiProcessor
from executor.workflows.action.action_executor import WorkflowActionExecutor
from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_actions.pd_notes_pb2 import PagerdutyNotesWorkflowAction
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class PagerdutyNotesExecutor(WorkflowActionExecutor):

    def __init__(self):
        self.source = Source.PAGER_DUTY
        self.type = WorkflowAction.Type.PAGERDUTY_NOTES

    def get_action_connector_processor(self, pagerduty_connector: ConnectorProto, **kwargs):
        if not pagerduty_connector:
            db_connector = get_db_connectors(connector_type=Source.PAGER_DUTY, is_active=True)
            if not db_connector:
                raise ValueError('Active Pagerduty connector is not configured')
            db_connector = db_connector.first()
            pagerduty_connector = db_connector.unmasked_proto

        generated_credentials = generate_credentials_dict(pagerduty_connector.type, pagerduty_connector.keys)
        return PdApiProcessor(**generated_credentials)

    def execute(self, action: WorkflowAction, execution_output: [InterpretationProto],
                connector: ConnectorProto = None):
        pd_config: PagerdutyNotesWorkflowAction = action.pagerduty_notes
        incident_id = pd_config.incident_id.value
        if not incident_id:
            raise ValueError('Pagerduty incident id is not configured in the notification config')
        logger.info(f"Sending note to incident {incident_id}")
        for i, interpretation in enumerate(execution_output):
            if i == 0 and interpretation.type == InterpretationProto.Type.SUMMARY:
                title = f'Hello team, here is snapshot of playbook: {interpretation.title.value}, link: {interpretation.description.value} ' \
                        f'that is configured for this incident'
            else:
                continue
            note_text = title
            note_params = {'incident_id': incident_id, 'content': note_text}
            try:
                pd_api_processor = self.get_action_connector_processor(connector)
                pd_api_processor.create_note(**note_params)
            except Exception as e:
                logger.error(f"Error creating notes for incident: {incident_id}, Error:{e}")
                raise e
