from executor.workflows.entry_point.alert_entry_point.alert_entry_point import AlertEntryPoint
from protos.playbooks.workflow_pb2 import WorkflowEntryPointAlertConfig as WorkflowEntryPointAlertConfigProto, \
    WorkflowEntryPointSlackChannelAlertConfig


def i_contains(string, substring):
    return substring.lower() in string.lower()


class SlackChannelAlertEntryPoint(AlertEntryPoint):
    def __init__(self):
        self.alert_type = WorkflowEntryPointAlertConfigProto.AlertType.SLACK_CHANNEL_ALERT

    def evaluate(self, alert_config: WorkflowEntryPointAlertConfigProto, alert) -> bool:
        slack_channel_alert_config: WorkflowEntryPointSlackChannelAlertConfig = alert_config.slack_channel_alert_config
        if not slack_channel_alert_config:
            return False
        if slack_channel_alert_config.slack_alert_type.value != alert.get('alert_type', ''):
            return False
        if slack_channel_alert_config.slack_channel_id.value != alert.get('slack_channel_id', ''):
            return False
        if not i_contains(alert.get('text', ''), slack_channel_alert_config.slack_alert_filter_string.value):
            return False
        return True
