from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto


class WorkflowEntryPointEvaluator:
    type: WorkflowEntryPointProto.Type = WorkflowEntryPointProto.Type.UNKNOWN

    def evaluate(self, entry_point: WorkflowEntryPointProto, event) -> bool:
        pass
