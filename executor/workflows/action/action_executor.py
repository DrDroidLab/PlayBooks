import logging

from protos.base_pb2 import Source
from protos.connectors.connector_pb2 import Connector
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation
from protos.playbooks.workflow_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class WorkflowActionExecutor:
    type = WorkflowAction.Type.UNKNOWN
    source = Source.UNKNOWN

    def get_action_connector_processor(self, connector: Connector, **kwargs):
        raise NotImplementedError('get_action_connector_processor method is not implemented')

    def execute(self, action: WorkflowAction, execution_output: [Interpretation], connector: Connector = None):
        raise NotImplementedError('execute method is not implemented')
