import logging

from accounts.models import Account
from executor.workflows.action.notify_action_executor.notifier import Notifier
from executor.workflows.action.notify_action_executor.slack_notifier import SlackNotifier
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_pb2 import DeprecatedWorkflowActionNotificationConfig as WorkflowActionNotificationConfigProto

logger = logging.getLogger(__name__)


class NotifierFacade:

    def __init__(self):
        self._map = {}

    def register(self, notification_type: WorkflowActionNotificationConfigProto.Type, notifier: Notifier.__class__):
        self._map[notification_type] = notifier

    def notify(self, account: Account, config: WorkflowActionNotificationConfigProto,
               execution_output: [InterpretationProto]) -> bool:
        if not account or not config or not execution_output:
            return False
        if config.type not in self._map:
            raise ValueError(f'Notification type {config.type} is not supported')
        notifier = self._map[config.type](account)
        return notifier.notify(config, execution_output)


notifier_facade = NotifierFacade()
notifier_facade.register(WorkflowActionNotificationConfigProto.Type.SLACK, SlackNotifier)
