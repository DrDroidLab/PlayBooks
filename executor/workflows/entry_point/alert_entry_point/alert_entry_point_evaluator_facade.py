import logging

from executor.workflows.entry_point.alert_entry_point.alert_entry_point import AlertEntryPoint
from executor.workflows.entry_point.alert_entry_point.slack_channel_alert_entry_point import SlackChannelAlertEntryPoint
from protos.playbooks.workflow_pb2 import WorkflowEntryPointAlertConfig as WorkflowEntryPointAlertConfigProto

logger = logging.getLogger(__name__)


class AlertEntryPointEvaluatorFacade:

    def __init__(self):
        self._map = {}

    def register(self, alert_type: WorkflowEntryPointAlertConfigProto.AlertType, evaluator: AlertEntryPoint):
        self._map[alert_type] = evaluator

    def evaluate(self, alert_config: WorkflowEntryPointAlertConfigProto,
                 alert_type: WorkflowEntryPointAlertConfigProto.AlertType, alert) -> bool:
        if not alert_config or not alert_type or not alert:
            return False
        return self._map.get(alert_type, AlertEntryPoint()).evaluate(alert_config, alert)


alert_entry_point_evaluator = AlertEntryPointEvaluatorFacade()
alert_entry_point_evaluator.register(WorkflowEntryPointAlertConfigProto.AlertType.SLACK_CHANNEL_ALERT,
                                     SlackChannelAlertEntryPoint())
