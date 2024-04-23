import logging
import uuid
from datetime import timedelta, datetime

from celery import shared_task

from executor.crud.playbook_execution_crud import create_playbook_execution
from executor.tasks import execute_playbook
from executor.workflows.crud.workflow_execution_crud import update_db_account_workflow_execution_status, \
    get_db_workflow_execution_logs, get_workflow_executions, create_workflow_execution_log
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from playbooks.utils.utils import current_datetime
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType
from utils.proto_utils import dict_to_proto

logger = logging.getLogger(__name__)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_scheduler():
    current_time_utc = current_datetime()
    current_time = current_time_utc.timestamp()
    all_scheduled_wf_executions = get_workflow_executions(status=WorkflowExecutionStatusType.WORKFLOW_SCHEDULED)
    for wf_execution in all_scheduled_wf_executions:
        workflow_id = wf_execution.workflow_id
        account = wf_execution.account
        if wf_execution.status == WorkflowExecutionStatusType.WORKFLOW_CANCELLED:
            logger.info(
                f"Workflow execution cancelled for workflow_execution_id: {wf_execution.id} at {current_time}")
            return True

        scheduled_at = wf_execution.scheduled_at
        if current_time_utc < scheduled_at:
            logger.info(f"Workflow execution not scheduled yet for workflow_execution_id: {wf_execution.id}")
            return True

        expiry_at = wf_execution.expiry_at
        if current_time_utc >= expiry_at:
            logger.info(f"Workflow execution expired for workflow_execution_id: {wf_execution.id}")
            update_db_account_workflow_execution_status(account, wf_execution.id,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
            return True
        wf_execution_logs = get_db_workflow_execution_logs(account, wf_execution.id)
        if wf_execution_logs:
            interval = wf_execution.interval
            latest_wf_execution_log = wf_execution_logs.first()
            next_schedule = latest_wf_execution_log.created_at + timedelta(seconds=interval)
            if current_time_utc < next_schedule:
                logger.info(f"Workflow execution already scheduled for workflow_execution_id: {wf_execution.id}")
                return True

        if wf_execution.status == WorkflowExecutionStatusType.WORKFLOW_SCHEDULED:
            update_db_account_workflow_execution_status(account, wf_execution.id,
                                                        WorkflowExecutionStatusType.WORKFLOW_RUNNING)
        time_range = wf_execution.time_range
        all_pbs = wf_execution.workflow.playbooks.filter(is_active=True)
        all_playbook_ids = [pb.id for pb in all_pbs]
        for pb_id in all_playbook_ids:
            try:
                playbook_run_uuid = f'{account.id}_{pb_id}_{str(current_time)}_{str(uuid.uuid4())}_run'
                time_range_proto = dict_to_proto(time_range, TimeRange)
                playbook_execution = create_playbook_execution(account, time_range_proto, pb_id, playbook_run_uuid,
                                                               wf_execution.created_by)
                saved_task = get_or_create_task(workflow_executor.__name__, account.id, workflow_id, wf_execution.id,
                                                pb_id, playbook_execution.id, time_range)
                if not saved_task:
                    logger.error(f"Failed to create workflow execution task for account: {account.id}, workflow_id: "
                                 f"{workflow_id}, workflow_execution_id: {wf_execution.id}, playbook_id: {pb_id}")
                    continue
                task = workflow_executor.delay(account.id, workflow_id, wf_execution.id, pb_id, playbook_execution.id,
                                               time_range)
                task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                  status=PeriodicTaskStatus.SCHEDULED,
                                                  account_id=account.id,
                                                  scheduled_at=datetime.fromtimestamp(float(current_time)))
            except Exception as e:
                logger.error(
                    f"Failed to create workflow execution:: workflow_id: {workflow_id}, workflow_execution_id: "
                    f"{wf_execution.id} playbook_id: {pb_id}, error: {e}")
                continue


workflow_scheduler_prerun_notifier = publish_pre_run_task(workflow_scheduler)
workflow_scheduler_failure_notifier = publish_task_failure(workflow_scheduler)
workflow_scheduler_postrun_notifier = publish_post_run_task(workflow_scheduler)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_executor(account_id, workflow_id, workflow_execution_id, playbook_id, playbook_execution_id, time_range):
    logger.info(f"Running workflow execution:: account_id: {account_id}, workflow_execution_id: "
                f"{workflow_execution_id}, playbook_execution_id: {playbook_execution_id}")
    try:
        create_workflow_execution_log(account_id, workflow_id, workflow_execution_id, playbook_execution_id)
        execute_playbook(account_id, playbook_id, playbook_execution_id, time_range)
    except Exception as exc:
        logger.error(f"Error occurred while running workflow execution: {exc}")
        raise exc


workflow_executor_prerun_notifier = publish_pre_run_task(workflow_executor)
workflow_executor_failure_notifier = publish_task_failure(workflow_executor)
workflow_executor_postrun_notifier = publish_post_run_task(workflow_executor)
