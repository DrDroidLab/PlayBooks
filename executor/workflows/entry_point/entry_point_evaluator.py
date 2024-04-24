import logging

from executor.workflows.entry_point.alert_entry_point.alert_entry_point_evaluator_facade import \
    alert_entry_point_evaluator
from executor.workflows.entry_point.api_entry_point.api_entry_point import api_entry_point
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto

logger = logging.getLogger(__name__)


def get_entry_point_evaluator(entry_point: WorkflowEntryPointProto.Type):
    if entry_point == WorkflowEntryPointProto.Type.API:
        return api_entry_point
    elif entry_point == WorkflowEntryPointProto.Type.ALERT:
        return alert_entry_point_evaluator
    else:
        raise NotImplementedError(f'Entry point type {entry_point} is not supported')
