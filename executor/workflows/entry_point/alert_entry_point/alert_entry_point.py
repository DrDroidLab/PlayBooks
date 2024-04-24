from protos.playbooks.workflow_pb2 import WorkflowEntryPointAlertConfig as WorkflowEntryPointAlertConfigProto


class AlertEntryPoint:
    alert_type: WorkflowEntryPointAlertConfigProto.AlertType = WorkflowEntryPointAlertConfigProto.AlertType.UNKNOWN

    def evaluate(self, alert_config: WorkflowEntryPointAlertConfigProto, alert) -> bool:
        pass
