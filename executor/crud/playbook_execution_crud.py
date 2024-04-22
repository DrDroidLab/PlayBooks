import logging

from django.utils import timezone

from accounts.models import Account
from executor.models import PlayBookExecution, PlayBookExecutionLog
from protos.base_pb2 import TimeRange
from protos.playbooks.playbook_pb2 import PlaybookExecutionStatusType
from utils.proto_utils import proto_to_dict

logger = logging.getLogger(__name__)


def get_db_playbook_execution(account: Account, playbook_execution_id=None, playbook_run_id=None, playbook_ids=None,
                              playbook_run_ids=None):
    filters = {}
    if playbook_execution_id:
        filters['id'] = playbook_execution_id
    if playbook_run_id:
        filters['playbook_run_id'] = playbook_run_id
    if playbook_ids:
        filters['playbook_id__in'] = playbook_ids
    if playbook_run_ids:
        filters['playbook_run_id__in'] = playbook_run_ids
    try:
        return account.playbookexecution_set.filter(**filters)
    except Exception as e:
        logger.error(
            f"Failed to get playbook execution for account_id: {account.id}, playbook_run_id: {playbook_run_id}, error: {e}")
    return None


def create_playbook_execution(account: Account, time_range: TimeRange, playbook_id, playbook_run_id, created_by=None):
    try:
        playbook_execution = PlayBookExecution.objects.create(
            account=account,
            playbook_id=playbook_id,
            playbook_run_id=playbook_run_id,
            status=PlaybookExecutionStatusType.CREATED,
            created_at=timezone.now(),
            time_range=proto_to_dict(time_range),
            created_by=created_by
        )
        return playbook_execution
    except Exception as e:
        raise e


def update_db_account_playbook_execution_status(account: Account, playbook_run_id: int,
                                                status: PlaybookExecutionStatusType):
    try:
        playbook_execution = account.playbookexecution_set.get(id=playbook_run_id)
        playbook_execution.status = status
        update_fields = ['status']
        if status == PlaybookExecutionStatusType.RUNNING:
            playbook_execution.started_at = timezone.now()
            update_fields.append('started_at')
        if status == PlaybookExecutionStatusType.FINISHED or status == PlaybookExecutionStatusType.FAILED:
            playbook_execution.finished_at = timezone.now()
            update_fields.append('finished_at')
        playbook_execution.save(update_fields=update_fields)
        return True
    except PlayBookExecution.DoesNotExist:
        logger.error(
            f"Failed to get playbook execution for account_id: {account.id}, playbook_run_id: {playbook_run_id}")
    except Exception as e:
        logger.error(
            f"Failed to get playbook execution for account_id: {account.id}, playbook_run_id: {playbook_run_id}, error: {e}")
    return False


def update_db_playbook_execution_status(playbook_run_id: str, status: PlaybookExecutionStatusType):
    try:
        playbook_execution = PlayBookExecution.objects.get(playbook_run_id=playbook_run_id)
        playbook_execution.status = status
        playbook_execution.save(update_fields=['status'])
        return True
    except PlayBookExecution.DoesNotExist:
        logger.error(f"Failed to get playbook execution for playbook_run_id: {playbook_run_id}")
    except Exception as e:
        logger.error(f"Failed to get playbook execution for  playbook_run_id: {playbook_run_id}, error: {e}")
    return False


def create_db_playbook_execution_log(account, playbook, playbook_execution, playbook_step, playbook_task_definition,
                                     playbook_task_result):
    try:
        playbook_execution_log = PlayBookExecutionLog.objects.create(
            account=account,
            playbook=playbook,
            playbook_execution=playbook_execution,
            playbook_step=playbook_step,
            playbook_task_definition=playbook_task_definition,
            playbook_task_result=playbook_task_result
        )
        return playbook_execution_log
    except Exception as e:
        logger.error(f"Failed to create playbook execution log with error: {e}")
        raise e


def bulk_create_playbook_execution_log(account, playbook, playbook_execution, all_step_results):
    all_db_playbook_execution_logs = []
    for step, all_task_results in all_step_results.items():
        for result in all_task_results:
            playbook_execution_log = PlayBookExecutionLog(
                account=account,
                playbook=playbook,
                playbook_execution=playbook_execution,
                playbook_step=step,
                playbook_task_definition=result['task'],
                playbook_task_result=result['task_result']
            )
            all_db_playbook_execution_logs.append(playbook_execution_log)
    try:
        PlayBookExecutionLog.objects.bulk_create(all_db_playbook_execution_logs)
    except Exception as e:
        logger.error(f"Failed to bulk create playbook execution logs with error: {e}")
        raise e
