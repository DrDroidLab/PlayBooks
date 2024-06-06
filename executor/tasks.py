import logging

from celery import shared_task
from google.protobuf.wrappers_pb2 import StringValue

from accounts.models import Account
from executor.crud.playbook_execution_crud import get_db_playbook_execution, update_db_playbook_execution_status, \
    update_db_account_playbook_execution_status, bulk_create_playbook_execution_log
from executor.crud.playbooks_crud import get_db_playbooks
from executor.models import PlayBook, PlayBookExecution
from executor.playbook_source_facade import playbook_source_facade
from intelligence_layer.result_interpreters.result_interpreter_facade import task_result_interpret, \
    step_result_interpret
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto, InterpreterType
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType, PlaybookTaskResult
from protos.playbooks.playbook_pb2 import Playbook as PlaybookProto, PlaybookTaskExecutionLog, PlaybookStepExecutionLog
from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


def execute_playbook_impl(tr: TimeRange, account: Account, playbook: PlaybookProto):
    try:
        global_variable_set = playbook.global_variable_set
        steps = playbook.steps
        step_execution_logs = []
        for step in steps:
            tasks = step.tasks
            interpreter_type: InterpreterType = step.interpreter_type if step.interpreter_type else InterpreterType.BASIC_I
            pte_logs = []
            task_interpretations = []
            for task_proto in tasks:
                try:
                    task_result: PlaybookTaskResult = playbook_source_facade.execute_task(account.id, tr,
                                                                                          global_variable_set,
                                                                                          task_proto)
                    task_interpretation: InterpretationProto = task_result_interpret(interpreter_type, task_proto,
                                                                                     task_result)
                    playbook_task_execution_log = PlaybookTaskExecutionLog(task=task_proto, result=task_result,
                                                                           interpretation=task_interpretation)
                    task_interpretations.append(task_interpretation)
                except Exception as exc:
                    logger.error(f"Error occurred while running task: {exc}")
                    playbook_task_execution_log = PlaybookTaskExecutionLog(task=task_proto,
                                                                           result=PlaybookTaskResult(
                                                                               error=StringValue(value=str(exc))))
                pte_logs.append(playbook_task_execution_log)
            step_interpretation = step_result_interpret(interpreter_type, step, task_interpretations)
            step_execution_log = PlaybookStepExecutionLog(step=step, task_execution_logs=pte_logs,
                                                          step_interpretation=step_interpretation)
            step_execution_logs.append(step_execution_log)
        return step_execution_logs
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        raise exc


def store_step_execution_logs(account: Account, db_playbook: PlayBook, db_pb_execution: PlayBookExecution,
                              step_execution_logs: [PlaybookStepExecutionLog]):
    try:
        all_step_executions = {}
        for sel in step_execution_logs:
            all_task_executions = []
            logger.info(f"Step Execution Log: {sel}")
            for tel in sel.task_execution_logs:
                logger.info(f"Task Execution Log: {tel}")
                all_task_executions.append({
                    'task_id': tel.task.id.value,
                    'task_result': proto_to_dict(tel.result),
                    'task_interpretation': proto_to_dict(tel.interpretation),
                })
            all_step_executions[sel.step.id.value] = {
                'all_task_executions': all_task_executions,
                'step_interpretation': proto_to_dict(sel.step_interpretation)
            }
        bulk_create_playbook_execution_log(account, db_playbook, db_pb_execution, all_step_executions)
    except Exception as exc:
        logger.error(f"Error occurred while storing step execution logs: {exc}")
        raise exc


@shared_task(max_retries=3, default_retry_delay=10)
def execute_playbook(account_id, playbook_id, playbook_execution_id, time_range):
    logger.info(f"Running playbook:: account_id: {account_id}, playbook_id: {playbook_id}, "
                f"playbook_execution_id: {playbook_execution_id} time_range: {time_range}")
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
    if pb_execution.time_range:
        tr: TimeRange = dict_to_proto(pb_execution.time_range, TimeRange)
    else:
        tr: TimeRange = dict_to_proto(time_range, TimeRange)
    pb_proto = pb.proto
    try:
        step_execution_logs: [PlaybookStepExecutionLog] = execute_playbook_impl(tr, account, pb_proto)
        store_step_execution_logs(account, pb, pb_execution, step_execution_logs)
        update_db_account_playbook_execution_status(account, playbook_execution_id,
                                                    PlaybookExecutionStatusType.FINISHED)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.FAILED)


execute_playbook_prerun_notifier = publish_pre_run_task(execute_playbook)
execute_playbook_failure_notifier = publish_task_failure(execute_playbook)
execute_playbook_postrun_notifier = publish_post_run_task(execute_playbook)
