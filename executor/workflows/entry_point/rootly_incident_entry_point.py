from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_entry_points.rootly_incident_entry_point_pb2 import RootlyIncidentEntryPoint
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint


class RootlyIncidentEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPoint.Type.ROOTLY_INCIDENT

    def evaluate(self, rootly_incident_ep: WorkflowEntryPoint, incident) -> bool:
        rootly_incident_config: RootlyIncidentEntryPoint = rootly_incident_ep.rootly_incident
        if not rootly_incident_config:
            return False
        if rootly_incident_config.incident_title and \
                rootly_incident_config.incident_title.value and \
                rootly_incident_config.incident_title.value not in incident.get('title', ''):
            return False
        return True
