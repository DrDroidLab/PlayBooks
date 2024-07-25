import logging

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.pd_api_processor import PdApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.source_task_definitions.pager_duty_task_pb2 import PagerDuty

logger = logging.getLogger(__name__)


class PagerDutySourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.PAGER_DUTY
        self.task_proto = PagerDuty
        self.task_type_callable_map = {
            PagerDuty.TaskType.SEND_NOTE: {
                'task_type': 'SEND_NOTE',
                'executor': self.execute_send_note,
                'model_types': [SourceModelType.PAGERDUTY_INCIDENT],
                'display_name': 'Send a note to a PagerDuty incident',
                'category': 'Actions'
            }
        }

    def get_connector_processor(self, pagerduty_connector, **kwargs):
        generated_credentials = generate_credentials_dict(pagerduty_connector.type, pagerduty_connector.keys)
        return PdApiProcessor(**generated_credentials)

    def execute_send_note(self, time_range: TimeRange, pd_task: PagerDuty,
                          pagerduty_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not pagerduty_connector:
                raise Exception("Task execution Failed:: No PagerDuty source found")

            send_note_task: PagerDuty.SendNote = pd_task.send_note
            print(send_note_task)
            incident_id = send_note_task.incident_id.value
            note = send_note_task.note.value
            if not incident_id:
                raise Exception("Task execution Failed:: No PagerDuty incident found")

            pd_api_processor = self.get_connector_processor(pagerduty_connector)
            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Incident ID -> {}".format("PagerDuty",
                                                                                                          pagerduty_connector.account_id.value,
                                                                                                          incident_id))

            return pd_api_processor.create_note(incident_id, note)
        except Exception as e:
            logger.error(f"Error in executing send note task: {str(e)}")
            return PlaybookTaskResult(source=self.source)
