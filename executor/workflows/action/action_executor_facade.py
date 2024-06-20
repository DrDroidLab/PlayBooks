from executor.workflows.action.action_executor import WorkflowActionExecutor
from executor.workflows.action.pagerduty_notes_executor import PagerdutyNotesExecutor
from executor.workflows.action.slack_message_executor import SlackMessageExecutor
from executor.workflows.action.slack_thread_reply_executor import SlackThreadReplyExecutor
from protos.connectors.connector_pb2 import Connector
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation
from protos.playbooks.workflow_pb2 import WorkflowAction


class WorkflowActionExecutorFacade:

    def __init__(self):
        self._map = {}

    def register(self, action_type: WorkflowAction.Type, executor: WorkflowActionExecutor):
        self._map[action_type] = executor

    def execute(self, action: WorkflowAction, execution_output: [Interpretation], connector: Connector = None):
        action_type = action.type
        if not action_type or action_type not in self._map:
            raise ValueError(f"Action type {action_type} is not supported")

        return self._map[action_type].execute(action, execution_output, connector)


action_executor_facade = WorkflowActionExecutorFacade()
action_executor_facade.register(WorkflowAction.Type.SLACK_MESSAGE, SlackMessageExecutor())
action_executor_facade.register(WorkflowAction.Type.SLACK_THREAD_REPLY, SlackThreadReplyExecutor())
action_executor_facade.register(WorkflowAction.Type.PAGERDUTY_NOTES, PagerdutyNotesExecutor())
