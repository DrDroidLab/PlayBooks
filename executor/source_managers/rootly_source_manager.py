import logging

from connectors.utils import generate_credentials_dict
from executor.playbook_source_manager import PlaybookSourceManager
from executor.source_processors.rootly_api_processor import RootlyApiProcessor
from protos.base_pb2 import Source, TimeRange, SourceModelType
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.source_task_definitions.rootly_task_pb2 import Rootly

logger = logging.getLogger(__name__)


class RootlySourceManager(PlaybookSourceManager):

    def __init__(self):
        self.source = Source.ROOTLY
        self.task_proto = Rootly
        self.task_type_callable_map = {
            Rootly.TaskType.SEND_TIMELINE_EVENT: {
                'task_type': 'SEND_TIMELINE_EVENT',
                'executor': self.execute_send_timeline_event,
                'model_types': [SourceModelType.ROOTLY_INCIDENT],
                'display_name': 'Send a timeline event to a Rootly incident',
                'category': 'Actions'
            }
        }

    def get_connector_processor(self, rootly_connector, **kwargs):
        generated_credentials = generate_credentials_dict(rootly_connector.type, rootly_connector.keys)
        return RootlyApiProcessor(**generated_credentials)

    def execute_send_timeline_event(self, time_range: TimeRange, rootly_task: Rootly,
                          rootly_connector: ConnectorProto) -> PlaybookTaskResult:
        try:
            if not rootly_connector:
                raise Exception("Task execution Failed:: No Rootly source found")

            send_timeline_event_task: Rootly.SendTimelineEvent = rootly_task.send_timeline_event
            print(send_timeline_event_task)
            incident_id = send_timeline_event_task.incident_id.value
            content = send_timeline_event_task.content.value
            if not incident_id:
                raise Exception("Task execution Failed:: No Rootly incident found")

            rootly_api_processor = self.get_connector_processor(rootly_connector)
            print("Playbook Task Downstream Request: Type -> {}, Account -> {}, Incident ID -> {}".format("Rootly",
                                                                                                          rootly_connector.account_id.value,
                                                                                                          incident_id))

            return rootly_api_processor.create_timeline_event(incident_id, content)
        except Exception as e:
            logger.error(f"Error in executing send note task: {str(e)}")
            return PlaybookTaskResult(source=self.source)
