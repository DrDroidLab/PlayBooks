from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_entry_points.slack_alert_entry_point_pb2 import \
    SlackChannelAlertEntryPoint as SlackChannelAlertEntryPointProto
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint


def i_contains(string, substring):
    return substring.lower() in string.lower()


class SlackChannelAlertEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPoint.Type.SLACK_CHANNEL_ALERT

    def evaluate(self, slack_channel_alert_ep: WorkflowEntryPoint, slack_alert) -> bool:
        slack_channel_alert_config: SlackChannelAlertEntryPointProto = slack_channel_alert_ep.slack_channel_alert
        if not slack_channel_alert_config:
            return False
        if slack_channel_alert_config.slack_channel_id.value != slack_alert.get('channel_id', ''):
            return False
        if slack_channel_alert_config.slack_alert_type and \
                slack_channel_alert_config.slack_alert_type.value and \
                slack_channel_alert_config.slack_alert_type.value != slack_alert.get('alert_type', ''):
            return False
        if slack_channel_alert_config.slack_alert_filter_string and \
                slack_channel_alert_config.slack_alert_filter_string.value and \
                slack_channel_alert_config.slack_alert_filter_string.value not in slack_alert.get('alert_text', ''):
            return False
        return True
