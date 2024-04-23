import logging

from accounts.models import Account
from executor.workflows.action.notify_action_executor.notify_facade import notifier_facade
from protos.playbooks.workflow_pb2 import WorkflowAction as WorkflowActionProto

logger = logging.getLogger(__name__)


def action_executor(account: Account, action: WorkflowActionProto, execution_output):
    if action.type == WorkflowActionProto.Type.NOTIFY:
        notifier_facade.notify(account, action.notification_config, execution_output)
    else:
        raise NotImplementedError(f'Action type {action.type} is not supported')
