import logging

from celery import shared_task

from accounts.models import Account
from executor.crud.playbook_execution_crud import get_db_playbook_execution, update_db_playbook_execution_status, \
    update_db_account_playbook_execution_status, bulk_create_playbook_execution_log
from executor.crud.playbooks_crud import get_db_playbooks
from executor.task_executor_facade import executor_facade
from intelligence_layer.result_interpreters.result_interpreter_facade import task_result_interpret, \
    step_result_interpret
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto, InterpreterType
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType
from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


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
        global_variable_set = pb_proto.global_variable_set
        steps = pb_proto.steps
        all_step_executions = {}
        task_interpretations = []
        for step in steps:
            interpreter_type: InterpreterType = step.interpreter_type if step.interpreter_type else InterpreterType.BASIC_I
            tasks = step.tasks
            all_task_executions = []
            for task_proto in tasks:
                task_result = executor_facade.execute_task(account.id, time_range, global_variable_set, task_proto)
                task_interpretation: InterpretationProto = task_result_interpret(interpreter_type, task_proto,
                                                                                 task_result)
                all_task_executions.append({
                    'task_id': task_proto.id.value,
                    'task_result': proto_to_dict(task_result),
                    'task_interpretation': proto_to_dict(task_interpretation),
                })
                task_interpretations.append(task_interpretation)
            step_interpretation = step_result_interpret(interpreter_type, step, task_interpretations)
            all_step_executions[step.id.value] = {
                'all_task_executions': all_task_executions,
                'step_interpretation': proto_to_dict(step_interpretation)
            }
        bulk_create_playbook_execution_log(account, pb, pb_execution, all_step_executions)
        update_db_account_playbook_execution_status(account, playbook_execution_id,
                                                    PlaybookExecutionStatusType.FINISHED)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.FAILED)


execute_playbook_prerun_notifier = publish_pre_run_task(execute_playbook)
execute_playbook_failure_notifier = publish_task_failure(execute_playbook)
execute_playbook_postrun_notifier = publish_post_run_task(execute_playbook)
