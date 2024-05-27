from accounts.models import Account
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation
from protos.playbooks.workflow_v2_pb2 import WorkflowAction


class WorkflowActionExecutor:
    def execute(self, account: Account, action: WorkflowAction, execution_output: [Interpretation]):
        pass
