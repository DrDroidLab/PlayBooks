import logging

from executor.workflows.entry_point.api_entry_point import ApiEntryPointEvaluator
from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from executor.workflows.entry_point.slack_channel_alert_entry_point import SlackChannelAlertEntryPointEvaluator
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto

logger = logging.getLogger(__name__)


class WorkflowEntryPointEvaluatorFacade:

    def __init__(self):
        self._map = {}

    def register(self, ep_type: WorkflowEntryPointProto.Type, evaluator: WorkflowEntryPointEvaluator):
        self._map[ep_type] = evaluator

    def evaluate(self, entry_point: WorkflowEntryPointProto, event) -> bool:
        ep_type = entry_point.type
        if not ep_type or ep_type not in self._map:
            raise ValueError(f"Entry point type {ep_type} is not supported")

        return self._map[ep_type].evaluate(entry_point, event)


entry_point_evaluator_facade = WorkflowEntryPointEvaluatorFacade()
entry_point_evaluator_facade.register(WorkflowEntryPointProto.Type.API, ApiEntryPointEvaluator())
entry_point_evaluator_facade.register(WorkflowEntryPointProto.Type.SLACK_CHANNEL_ALERT,
                                      SlackChannelAlertEntryPointEvaluator())
