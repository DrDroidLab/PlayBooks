import logging

from celery import shared_task

from accounts.models import Account
from executor.crud.playbook_execution_crud import get_db_playbook_execution, update_db_playbook_execution_status, \
    update_db_account_playbook_execution_status, bulk_create_playbook_execution_log
from executor.crud.playbooks_crud import get_db_playbooks, get_db_playbook_step, get_db_playbook_task_definitions
from executor.task_executor import execute_task
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.base_pb2 import TimeRange
from protos.playbooks.playbook_pb2 import PlaybookExecutionStatusType
from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


@shared_task(max_retries=3, default_retry_delay=10)
def execute_playbook(account_id, playbook_id, playbook_execution_id, time_range):
    tr: TimeRange = dict_to_proto(time_range, TimeRange)
    logger.info(f"Running playbook:: account_id: {account_id}, playbook_id: {playbook_id}, "
                f"playbook_execution_id: {playbook_execution_id}")
    try:
        account = Account.objects.get(id=account_id)
        pb = get_db_playbooks(account, playbook_id=playbook_id, is_active=True)
        pb_execution = get_db_playbook_execution(account, playbook_execution_id=playbook_execution_id)
        if not pb or not pb_execution:
            raise Exception("Playbook or Playbook Execution not found")
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        run_updated = update_db_playbook_execution_status(playbook_execution_id, PlaybookExecutionStatusType.FAILED)
        if not run_updated:
            logger.error(f"Failed to update playbook run status to FAILED for "
                         f"playbook_execution_id: {playbook_execution_id}")
        return False

    update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.RUNNING)
    pb = pb.first()
    pb_execution = pb_execution.first()
    playbook_steps = get_db_playbook_step(account, playbook_id, is_active=True)
    try:
        all_step_executions = {}
        for step in list(playbook_steps):
            playbook_task_definitions = get_db_playbook_task_definitions(account, playbook_id, step.id, is_active=True)
            playbook_task_definitions = playbook_task_definitions.order_by('created_at')
            all_task_executions = []
            for task in playbook_task_definitions:
                task_proto = task.proto
                task_result = execute_task(account_id, tr, task_proto)
                all_task_executions.append({
                    'task': task,
                    'task_result': proto_to_dict(task_result),
                })
            all_step_executions[step] = all_task_executions
        bulk_create_playbook_execution_log(account, pb, pb_execution, all_step_executions)
        update_db_account_playbook_execution_status(account, playbook_execution_id,
                                                    PlaybookExecutionStatusType.FINISHED)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.FAILED)


execute_playbook_prerun_notifier = publish_pre_run_task(execute_playbook)
execute_playbook_failure_notifier = publish_task_failure(execute_playbook)
execute_playbook_postrun_notifier = publish_post_run_task(execute_playbook)
