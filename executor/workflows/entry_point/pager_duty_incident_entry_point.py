from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_entry_points.pd_incident_entry_point_pb2 import PagerDutyIncidentEntryPoint
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint


class PagerDutyIncidentEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPoint.Type.PAGERDUTY_INCIDENT

    def evaluate(self, pd_incident_ep: WorkflowEntryPoint, incident) -> bool:
        pd_incident_config: PagerDutyIncidentEntryPoint = pd_incident_ep.pagerduty_incident
        if not pd_incident_config:
            return False
        if pd_incident_config.incident_title and \
                pd_incident_config.incident_title.value and \
                pd_incident_config.incident_title.value != incident.get('title', ''):
            return False
        if pd_incident_config.service_name and \
                pd_incident_config.service_name.value and \
                pd_incident_config.service_name.value not in incident.get('service_name', ''):
            return False
        return True
