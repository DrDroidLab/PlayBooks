from typing import Dict

from connectors.crud.connectors_crud import get_db_connectors
from connectors.models import integrations_connector_type_connector_keys_map
from executor.source_processors.no_op_processor import NoOpProcessor
from executor.source_processors.processor import Processor
from protos.base_pb2 import TimeRange, Source
from protos.connectors.connector_pb2 import Connector as ConnectorProto
from protos.playbooks.playbook_commons_pb2 import PlaybookTaskResult
from protos.playbooks.playbook_pb2 import PlaybookTask
from utils.proto_utils import proto_to_dict, dict_to_proto


class PlaybookSourceManager:
    source: Source = Source.UNKNOWN
    task_proto = None
    task_type_callable_map = {}

    @staticmethod
    def validate_connector(connector: ConnectorProto) -> bool:
        keys = connector.keys
        all_ck_types = [ck.key_type for ck in keys]
        required_key_types = integrations_connector_type_connector_keys_map.get(connector.type, [])
        all_keys_found = False
        for rkt in required_key_types:
            if sorted(rkt) == sorted(all_ck_types):
                all_keys_found = True
                break
        return all_keys_found

    def get_connector_processor(self, connector: ConnectorProto, **kwargs):
        return NoOpProcessor()

    def test_connector_processor(self, connector: ConnectorProto, **kwargs):
        processor: Processor = self.get_connector_processor(connector, **kwargs)
        return processor.test_connection()

    def get_task_type_callable_map(self):
        return self.task_type_callable_map

    def get_active_connectors(self, account_id, connector_id: int = None) -> [ConnectorProto]:
        db_connectors = get_db_connectors(account_id=account_id, connector_type=self.source, is_active=True)
        if connector_id:
            db_connectors = db_connectors.filter(id=connector_id)
        connector_protos: [ConnectorProto] = []
        for dbc in db_connectors:
            if self.validate_connector(dbc.unmasked_proto):
                connector_protos.append(dbc.unmasked_proto)
        return connector_protos

    def execute_task(self, account_id, time_range: TimeRange, global_variable_set: Dict,
                     task: PlaybookTask) -> PlaybookTaskResult:
        try:
            source_connector_proto = None
            if task.task_connector_sources:
                # TODO: Handle multiple connectors within task in future
                task_connector_source = task.task_connector_sources[0]
                connector_id = task_connector_source.id.value
                all_active_valid_connectors = self.get_active_connectors(account_id=account_id,
                                                                         connector_id=connector_id)
                source_connector_proto = all_active_valid_connectors[0] if len(
                    all_active_valid_connectors) > 0 else None

            task_dict = proto_to_dict(task)
            source = task_dict.get('source', '')
            if not source:
                raise Exception("Source not found in task")
            source_str = source.lower()
            source_task = task_dict.get(source_str, None)
            if not source_task:
                raise Exception(f"Source task not found in task: {source_str}")
            source_task_proto = dict_to_proto(source_task, self.task_proto)
            task_type = source_task_proto.type
            if task_type in self.task_type_callable_map:
                try:
                    return self.task_type_callable_map[task_type]['executor'](time_range, global_variable_set,
                                                                              source_task_proto, source_connector_proto)
                except Exception as e:
                    raise Exception(f"Error while executing task for source: {source_str} with error: {e}")
            else:
                raise Exception(f"Task type {task_type} not supported for source: {source_str}")
        except Exception as e:
            raise Exception(f"Error while executing task: {e}")
