import logging

from django.utils import timezone

from accounts.models import Account
from executor.workflows.models import WorkflowExecution, WorkflowExecutionLog
from playbooks.utils.utils import current_datetime
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


def get_db_workflow_executions(account: Account, workflow_execution_id=None, workflow_run_id=None, workflow_ids=None,
                               status: WorkflowExecutionStatusType = None):
    filters = {}
    if workflow_execution_id:
        filters['id'] = workflow_execution_id
    if workflow_run_id:
        filters['workflow_run_id'] = workflow_run_id
    if workflow_ids:
        filters['workflow_id__in'] = workflow_ids
    if status:
        filters['status'] = status
    try:
        return account.workflowexecution_set.filter(**filters)
    except Exception as e:
        logger.error(f"Failed to get workflow execution for account_id: {account.id}, with error: {str(e)}")
    return None


def get_workflow_executions(account_id=None, workflow_execution_id=None, workflow_run_id=None,
                            workflow_ids=None, status: WorkflowExecutionStatusType = None):
    filters = {}
    if account_id:
        filters['account_id'] = account_id
    if workflow_execution_id:
        filters['id'] = workflow_execution_id
    if workflow_run_id:
        filters['workflow_run_id'] = workflow_run_id
    if workflow_ids:
        filters['workflow_id__in'] = workflow_ids
    if status:
        filters['status'] = status
    try:
        all_we = WorkflowExecution.objects.all()
        all_we = all_we.select_related('workflow')
        all_we = all_we.select_related('account')
        if filters:
            all_we = all_we.filter(**filters)
        return all_we
    except Exception as e:
        logger.error(f"Failed to get workflow execution with error: {str(e)}")
    return None


def get_db_workflow_execution_logs(account: Account, workflow_execution_id):
    try:
        return account.workflowexecutionlog_set.filter(workflow_execution_id=workflow_execution_id).order_by(
            '-created_at')
    except Exception as e:
        logger.error(f"Failed to get workflow execution logs for account_id: {account.id}, "
                     f"workflow_execution_id: {workflow_execution_id}, error: {e}")
    return None


def create_workflow_execution(account: Account, time_range: TimeRange, workflow_id, workflow_run_id, scheduled_at,
                              expiry_at, interval, created_by=None):
    try:
        workflow_execution = WorkflowExecution.objects.create(
            account=account,
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
            scheduled_at=scheduled_at,
            expiry_at=expiry_at,
            interval=interval,
            status=WorkflowExecutionStatusType.WORKFLOW_SCHEDULED,
            created_at=timezone.now(),
            time_range=proto_to_dict(time_range),
            created_by=created_by
        )
        return workflow_execution
    except Exception as e:
        logger.error(f"Failed to create workflow execution with error: {e}")
        raise e


def update_db_account_workflow_execution_status(account: Account, workflow_run_id: int,
                                                status: WorkflowExecutionStatusType):
    try:
        workflow_execution = account.workflowexecution_set.get(id=workflow_run_id)
        workflow_execution.status = status
        update_fields = ['status']
        if status == WorkflowExecutionStatusType.WORKFLOW_RUNNING:
            workflow_execution.started_at = current_datetime()
            update_fields.append('started_at')
        if status in [WorkflowExecutionStatusType.WORKFLOW_FINISHED, WorkflowExecutionStatusType.WORKFLOW_FAILED,
                      WorkflowExecutionStatusType.WORKFLOW_CANCELLED]:
            workflow_execution.finished_at = current_datetime()
            update_fields.append('finished_at')
        workflow_execution.save(update_fields=update_fields)
        return True
    except WorkflowExecution.DoesNotExist:
        logger.error(f"Failed to get workflow execution for account_id: {account.id}, "
                     f"workflow_run_id: {workflow_run_id}")
    except Exception as e:
        logger.error(f"Failed to update workflow execution status for account_id: {account.id}, "
                     f"workflow_run_id: {workflow_run_id}, error: {e}")
    return False


def update_db_workflow_execution_status(workflow_execution_id: int, status: WorkflowExecutionStatusType):
    try:
        workflow_execution = WorkflowExecution.objects.get(id=workflow_execution_id)
        workflow_execution.status = status
        workflow_execution.save(update_fields=['status'])
        return True
    except WorkflowExecution.DoesNotExist:
        logger.error(f"Failed to get workflow execution for id: {workflow_execution_id}")
    except Exception as e:
        logger.error(f"Failed to update workflow execution status for id: {workflow_execution_id}, error: {e}")
    return False


def create_workflow_execution_log(account_id, workflow_id, workflow_execution_id, playbook_execution_id):
    try:
        WorkflowExecutionLog.objects.create(
            account_id=account_id,
            workflow_id=workflow_id,
            workflow_execution_id=workflow_execution_id,
            playbook_execution_id=playbook_execution_id
        )
    except Exception as e:
        logger.error(f"Failed to bulk create workflow execution logs with error: {e}")
        raise e
