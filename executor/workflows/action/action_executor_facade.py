import logging

from accounts.models import Account
from executor.workflows.action.action_executor import WorkflowActionExecutor
from executor.workflows.action.executors.slack_message_notify_action import SlackMessageExecutor
from executor.workflows.action.executors.slack_thread_reply_action import SlackThreadReplyExecutor
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_v2_pb2 import WorkflowAction

logger = logging.getLogger(__name__)


class WorkflowActionExecutorFacade:
    def __init__(self):
        self._map = {}

    def register(self, action_type: WorkflowAction.Type, executor: WorkflowActionExecutor):
        self._map[action_type] = executor

    def execute(self, account: Account, action: WorkflowAction, execution_output: [InterpretationProto]):
        if not account or not action:
            raise ValueError('Account and action are required for execution')
        action_type = action.type
        if not action_type:
            raise ValueError('Action type is required for execution')
        if action_type not in self._map:
            raise ValueError(f'Action type {action_type} not registered')
        return self._map[action_type].execute(account, action, execution_output)


workflow_action_executor = WorkflowActionExecutorFacade()
workflow_action_executor.register(WorkflowAction.Type.SLACK_MESSAGE_NOTIFY, SlackMessageExecutor())
workflow_action_executor.register(WorkflowAction.Type.SLACK_THREAD_REPLY, SlackThreadReplyExecutor())
