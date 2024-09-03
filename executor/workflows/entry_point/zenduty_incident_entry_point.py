from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_entry_points.zd_incident_entry_point_pb2 import ZenDutyIncidentEntryPoint
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint


class ZenDutyIncidentEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPoint.Type.ZENDUTY_INCIDENT

    def evaluate(self, zd_incident_ep: WorkflowEntryPoint, incident) -> bool:
        zd_incident_config: ZenDutyIncidentEntryPoint = zd_incident_ep.zenduty_incident
        if not zd_incident_config:
            return False
        if zd_incident_config.service_name and \
                zd_incident_config.service_name.value and \
                zd_incident_config.service_name.value != incident.get('service_name', ''):
            return False
        if zd_incident_config.incident_title and \
                zd_incident_config.incident_title.value and \
                zd_incident_config.incident_title.value not in incident.get('title', ''):
            return False
        return True
