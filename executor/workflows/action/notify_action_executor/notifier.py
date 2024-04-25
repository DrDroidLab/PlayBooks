from accounts.models import Account
from protos.playbooks.workflow_pb2 import WorkflowActionNotificationConfig as WorkflowActionNotificationConfigProto


class Notifier:
    type: WorkflowActionNotificationConfigProto.Type = WorkflowActionNotificationConfigProto.Type.UNKNOWN
    account: Account = None

    def notify(self, config: WorkflowActionNotificationConfigProto, execution_output) -> bool:
        pass
