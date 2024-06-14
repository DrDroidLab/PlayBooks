import logging

from executor.workflows.models import WorkflowEntryPoint, WorkflowEntryPointMapping

from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto

logger = logging.getLogger(__name__)


def get_db_workflow_entry_points(account_id=None, entry_point_type: WorkflowEntryPointProto.Type = None, is_active=True):
    filters = {}
    if account_id:
        filters['account_id'] = account_id
    if entry_point_type:
        filters['type'] = entry_point_type
    if is_active is not None:
        filters['is_active'] = is_active
    try:
        return WorkflowEntryPoint.objects.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get workflow entry points with error: {str(e)}")
    return None


def get_db_workflow_entry_point_mappings(account_id=None, entry_point_id=None, is_active=True):
    filters = {}
    if account_id:
        filters['account_id'] = account_id
    if entry_point_id:
        filters['entry_point_id'] = entry_point_id
    if is_active is not None:
        filters['is_active'] = is_active
    try:
        return WorkflowEntryPointMapping.objects.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get workflow entry point mappings with error: {str(e)}")
    return None
