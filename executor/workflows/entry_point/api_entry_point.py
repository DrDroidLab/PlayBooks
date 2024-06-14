from executor.workflows.entry_point.entry_point_evaluator import WorkflowEntryPointEvaluator
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto


class ApiEntryPointEvaluator(WorkflowEntryPointEvaluator):
    def __init__(self):
        self.type = WorkflowEntryPointProto.Type.API

    def evaluate(self, api_ep: WorkflowEntryPointProto, event) -> bool:
        return True
