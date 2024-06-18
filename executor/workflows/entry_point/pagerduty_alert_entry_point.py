from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_entry_points.pd_alert_entry_point_pb2 import \
    PagerDutyAlertEntryPoint as PagerDutyAlertEntryPointProto
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint


class PagerDutyAlertEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPoint.Type.PAGERDUTY_ALERT

    def evaluate(self, pd_incident_ep: WorkflowEntryPoint, pd_incident) -> bool:
        pd_alert_config: PagerDutyAlertEntryPointProto = pd_incident_ep.pd_incident
        if not pd_alert_config:
            return False
        if pd_alert_config.pd_incident_id.value != pd_incident.get('incident_id', ''):
            return False
        if pd_alert_config.pd_alert_title and \
                pd_alert_config.pd_incident_title.value and \
                pd_alert_config.pd_incident_title.value != pd_incident.get('incident_title', ''):
            return False
        if pd_alert_config.pd_service_id and \
                pd_alert_config.pd_service_id.value and \
                pd_alert_config.pd_service_id.value != pd_incident.get('service_id', ''):
            return False

        return True
