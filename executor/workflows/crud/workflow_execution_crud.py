import logging

from django.utils import timezone

from accounts.models import Account
from executor.workflows.models import WorkflowExecution, WorkflowExecutionLog
from utils.time_utils import current_datetime
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


def get_db_workflow_executions(account: Account, workflow_execution_id=None, workflow_run_id=None, workflow_ids=None,
                               status: WorkflowExecutionStatusType = None, workflow_run_ids=None):
    filters = {}
    if workflow_execution_id:
        filters['id'] = workflow_execution_id
    if workflow_run_id:
        filters['workflow_run_id'] = workflow_run_id
    if workflow_ids:
        filters['workflow_id__in'] = workflow_ids
    if status:
        filters['status'] = status
    if workflow_run_ids:
        filters['workflow_run_id__in'] = workflow_run_ids
    try:
        db_we = account.workflowexecution_set.all()
        db_we = db_we.order_by('-workflow_run_id', 'scheduled_at')
        if filters:
            db_we = db_we.filter(**filters)
        return db_we
    except Exception as e:
        logger.error(f"Failed to get workflow execution for account_id: {account.id}, with error: {str(e)}")
    return None


def get_workflow_executions(account_id=None, workflow_execution_id=None, workflow_run_id=None,
                            workflow_ids=None, status: WorkflowExecutionStatusType = None,
                            status_in: [WorkflowExecutionStatusType] = None):
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
    if status_in:
        filters['status__in'] = status_in
    try:
        all_we = WorkflowExecution.objects.all()
        all_we = all_we.select_related('workflow')
        all_we = all_we.select_related('account')
        if filters:
            all_we = all_we.filter(**filters)
        all_we = all_we.order_by('scheduled_at')
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


def create_workflow_execution(account: Account, time_range: TimeRange, workflow_id, workflow_run_id,
                              scheduled_at, latest_scheduled_at, expiry_at=None, keep_alive=False, created_by=None,
                              metadata=None, execution_configuration=None):
    try:
        workflow_execution = WorkflowExecution.objects.create(
            account=account,
            workflow_id=workflow_id,
            workflow_run_id=workflow_run_id,
            scheduled_at=scheduled_at,
            expiry_at=expiry_at,
            status=WorkflowExecutionStatusType.WORKFLOW_SCHEDULED,
            created_at=timezone.now(),
            time_range=proto_to_dict(time_range),
            created_by=created_by,
            metadata=metadata,
            execution_configuration=execution_configuration,
            keep_alive=keep_alive,
            total_executions=0,
            latest_scheduled_at=latest_scheduled_at
        )
        return workflow_execution
    except Exception as e:
        logger.error(f"Failed to create workflow execution with error: {e}")
        raise e


def update_db_account_workflow_execution_status(account: Account, workflow_execution_id: int,
                                                status: WorkflowExecutionStatusType):
    try:
        workflow_execution = account.workflowexecution_set.get(id=workflow_execution_id)
        workflow_execution.status = status
        update_fields = ['status']
        if status == WorkflowExecutionStatusType.WORKFLOW_RUNNING:
            if workflow_execution.status == WorkflowExecutionStatusType.WORKFLOW_SCHEDULED:
                workflow_execution.started_at = current_datetime()
                update_fields.append('started_at')
            workflow_execution.total_executions += 1
            update_fields.append('total_executions')
        elif status in [WorkflowExecutionStatusType.WORKFLOW_FINISHED, WorkflowExecutionStatusType.WORKFLOW_FAILED,
                        WorkflowExecutionStatusType.WORKFLOW_CANCELLED]:
            workflow_execution.finished_at = current_datetime()
            update_fields.append('finished_at')
        else:
            logger.error(f"Invalid status: {status} for workflow execution id: {workflow_execution_id}")
            return False
        workflow_execution.save(update_fields=update_fields)
        return True
    except WorkflowExecution.DoesNotExist:
        logger.error(f"Failed to get workflow execution for account_id: {account.id}, "
                     f"workflow_execution_id: {workflow_execution_id}")
    except Exception as e:
        logger.error(f"Failed to update workflow execution status for account_id: {account.id}, "
                     f"workflow_execution_id: {workflow_execution_id}, error: {e}")
    return False


def update_db_account_workflow_execution_latest_scheduled_at(account: Account, workflow_execution_id: int,
                                                             latest_scheduled_at):
    try:
        workflow_execution = account.workflowexecution_set.get(id=workflow_execution_id)
        workflow_execution.latest_scheduled_at = latest_scheduled_at
        update_fields = ['latest_scheduled_at']
        workflow_execution.save(update_fields=update_fields)
        return True
    except WorkflowExecution.DoesNotExist:
        logger.error(f"Failed to get workflow execution for account_id: {account.id}, "
                     f"workflow_execution_id: {workflow_execution_id}")
    except Exception as e:
        logger.error(f"Failed to update workflow execution latest_scheduled_at for account_id: {account.id}, "
                     f"workflow_execution_id: {workflow_execution_id}, error: {e}")
    return False


def create_workflow_execution_log(account_id, workflow_id, workflow_execution_id, playbook_execution_id):
    try:
        WorkflowExecutionLog.objects.create(
            account_id=account_id,
            workflow_id=workflow_id,
            workflow_execution_id=workflow_execution_id,
            playbook_execution_id=playbook_execution_id,
        )
    except Exception as e:
        logger.error(f"Failed to bulk create workflow execution logs with error: {e}")
        raise e
