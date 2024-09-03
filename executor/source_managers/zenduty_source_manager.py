import logging

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.zenduty_api_processor import ZendutyApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.source_task_definitions.zenduty_task_pb2 import Zenduty

logger = logging.getLogger(__name__)


class ZendutySourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.ZENDUTY
        self.task_proto = Zenduty
        self.task_type_callable_map = {
            Zenduty.TaskType.SEND_NOTE: {
                'task_type': 'SEND_NOTE',
                'executor': self.execute_send_note,
                'model_types': [SourceModelType.ZENDUTY_INCIDENT],
                'display_name': 'Send a note to a Zenduty incident',
                'category': 'Actions'
            }
        }

    def get_connector_processor(self, zenduty_connector, **kwargs):
        generated_credentials = generate_credentials_dict(zenduty_connector.type, zenduty_connector.keys)
        return ZendutyApiProcessor(**generated_credentials)

    def execute_send_note(self, time_range: TimeRange, zd_task: Zenduty,
                          zenduty_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not zenduty_connector:
                raise Exception("Task execution Failed:: No Zenduty source found")

            send_note_task: Zenduty.SendNote = zd_task.send_note
            print(send_note_task)
            incident_id = send_note_task.incident_number
            note = send_note_task.note.value
            if not incident_id:
                raise Exception("Task execution Failed:: No ZenDuty incident found")

            zd_api_processor = self.get_connector_processor(zenduty_connector)
            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Incident ID -> {}".format("Zenduty",
                                                                                                          zenduty_connector.account_id.value,
                                                                                                          incident_id))

            return zd_api_processor.create_note(incident_id, note)
        except Exception as e:
            logger.error(f"Error in executing send note task: {str(e)}")
            return PlaybookTaskResult(source=self.source)

    def test_connector_processor(self, connector: ConnectorProto, **kwargs):
        zenduty_processor = self.get_connector_processor(connector, client_type='zenduty')
        try:
            return zenduty_processor.test_connection()
        except Exception as e:
            raise e