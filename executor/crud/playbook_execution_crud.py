import logging

from django.utils import timezone

from accounts.models import Account
from executor.models import PlayBookExecution, PlayBookTaskExecutionLog, PlayBookStepExecutionLog, \
    PlayBookStepRelationExecutionLog
from protos.base_pb2 import TimeRange
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType
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


def create_playbook_execution(account: Account, time_range: TimeRange, playbook_id, playbook_run_id, created_by=None,
                              execution_global_variable_set=None):
    try:
        playbook_execution = PlayBookExecution.objects.create(
            account=account,
            playbook_id=playbook_id,
            playbook_run_id=playbook_run_id,
            status=PlaybookExecutionStatusType.CREATED,
            created_at=timezone.now(),
            time_range=proto_to_dict(time_range),
            created_by=created_by,
            execution_global_variable_set=execution_global_variable_set
        )
        return playbook_execution
    except Exception as e:
        raise e


def update_db_account_playbook_execution_status(account: Account, playbook_execution_id: int,
                                                status: PlaybookExecutionStatusType):
    try:
        playbook_execution = account.playbookexecution_set.get(id=playbook_execution_id)
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
            f"Failed to get playbook execution for account_id: {account.id}, playbook_run_id: {playbook_execution_id}")
    except Exception as e:
        logger.error(
            f"Failed to get playbook execution for account_id: {account.id}, playbook_run_id: {playbook_execution_id}, error: {e}")
    return False


def update_db_account_playbook_execution_global_variable_set(account: Account, playbook_execution_id: int,
                                                             execution_global_variable_set=None):
    try:
        playbook_execution = account.playbookexecution_set.get(id=playbook_execution_id)
        playbook_execution.execution_global_variable_set = execution_global_variable_set
        update_fields = ['execution_global_variable_set']
        playbook_execution.save(update_fields=update_fields)
        return True
    except PlayBookExecution.DoesNotExist:
        logger.error(
            f"Failed to update playbook execution for account_id: {account.id}, playbook_run_id: {playbook_execution_id}")
    except Exception as e:
        logger.error(
            f"Failed to update playbook execution for account_id: {account.id}, playbook_run_id: {playbook_execution_id}, error: {e}")
    return False


def update_db_playbook_execution_status(playbook_execution_id: int, status: PlaybookExecutionStatusType):
    try:
        playbook_execution = PlayBookExecution.objects.get(id=playbook_execution_id)
        playbook_execution.status = status
        playbook_execution.save(update_fields=['status'])
        return True
    except PlayBookExecution.DoesNotExist:
        logger.error(f"Failed to get playbook execution for id: {playbook_execution_id}")
    except Exception as e:
        logger.error(f"Failed to get playbook execution for  id: {playbook_execution_id}, error: {e}")
    return False


def bulk_create_playbook_execution_log(account, playbook, playbook_execution, all_step_results, user=None,
                                       tr=None):
    all_db_playbook_execution_logs = []
    all_db_playbook_step_relation_execution_logs = []
    if not user:
        user = playbook_execution.created_by
    if tr:
        time_range = proto_to_dict(tr)
    else:
        time_range = playbook_execution.time_range
    for step_id, all_results in all_step_results.items():
        step_interpretation = all_results['step_interpretation']
        all_task_executions = all_results['all_task_executions']
        all_step_relation_executions = all_results['all_step_relation_executions']

        try:
            playbook_step_execution_log = PlayBookStepExecutionLog.objects.create(
                account=account,
                playbook=playbook,
                playbook_execution=playbook_execution,
                playbook_step_id=step_id,
                interpretation=step_interpretation,
                created_by=user,
                time_range=time_range
            )
        except Exception as e:
            logger.error(f"Failed to create playbook step execution log with error: {e}")
            raise e

        for result in all_task_executions:
            playbook_task_execution_log = PlayBookTaskExecutionLog(
                account=account,
                playbook=playbook,
                playbook_execution=playbook_execution,
                playbook_step_id=step_id,
                playbook_task_definition_id=result['task_id'],
                playbook_step_execution_log=playbook_step_execution_log,
                playbook_task_result=result['task_result'],
                interpretation=result['task_interpretation'],
                created_by=user,
                time_range=time_range,
                execution_global_variable_set=result['execution_global_variable_set']
            )
            all_db_playbook_execution_logs.append(playbook_task_execution_log)
        for step_relation_execution_log in all_step_relation_executions:
            playbook_step_relation_execution_log = PlayBookStepRelationExecutionLog(
                account=account,
                playbook=playbook,
                playbook_step_relation_id=step_relation_execution_log['relation_id'],
                playbook_execution=playbook_execution,
                playbook_step_execution_log=playbook_step_execution_log,
                evaluation_result=step_relation_execution_log['evaluation_result'],
                evaluation_output=step_relation_execution_log['evaluation_output'],
                interpretation=step_relation_execution_log['step_relation_interpretation']
            )
            all_db_playbook_step_relation_execution_logs.append(playbook_step_relation_execution_log)

    try:
        PlayBookTaskExecutionLog.objects.bulk_create(all_db_playbook_execution_logs)
        PlayBookStepRelationExecutionLog.objects.bulk_create(all_db_playbook_step_relation_execution_logs)
    except Exception as e:
        logger.error(f"Failed to bulk create playbook execution logs with error: {e}")
        raise e
