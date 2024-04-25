import logging
from datetime import timedelta, datetime

from celery import shared_task
from django.conf import settings

from accounts.models import Account
from executor.crud.playbook_execution_crud import create_playbook_execution, get_db_playbook_execution
from executor.tasks import execute_playbook
from executor.workflows.action.action_executor import action_executor
from executor.workflows.crud.workflow_execution_crud import get_db_workflow_executions, \
    update_db_account_workflow_execution_status, \
    get_db_workflow_execution_logs, get_workflow_executions, create_workflow_execution_log, \
    update_db_account_workflow_execution_count_increment
from executor.workflows.crud.workflows_crud import get_db_workflows
from intelligence_layer.task_result_interpreters.task_result_interpreter_facade import \
    playbook_execution_result_interpret
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from playbooks.utils.utils import current_datetime
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import InterpreterType, Interpretation as InterpretationProto
from protos.playbooks.playbook_pb2 import PlaybookExecution as PlaybookExecutionProto
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType, Workflow as WorkflowProto, \
    WorkflowAction as WorkflowActionProto, WorkflowActionNotificationConfig, WorkflowActionSlackNotificationConfig
from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_scheduler():
    current_time_utc = current_datetime()
    current_time = int(current_time_utc.timestamp())
    all_scheduled_wf_executions = get_workflow_executions(
        status_in=[WorkflowExecutionStatusType.WORKFLOW_SCHEDULED, WorkflowExecutionStatusType.WORKFLOW_RUNNING])
    for wf_execution in all_scheduled_wf_executions:
        print('wf_execution', wf_execution)
        workflow_id = wf_execution.workflow_id
        account = wf_execution.account
        if wf_execution.status == WorkflowExecutionStatusType.WORKFLOW_CANCELLED:
            logger.info(
                f"Workflow execution cancelled for workflow_execution_id: {wf_execution.id} at {current_time}")
            continue

        scheduled_at = wf_execution.scheduled_at
        if current_time_utc < scheduled_at:
            logger.info(f"Workflow execution not scheduled yet for workflow_execution_id: {wf_execution.id}")
            continue

        expiry_at = wf_execution.expiry_at
        interval = wf_execution.interval
        if current_time_utc > expiry_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL)):
            logger.info(f"Workflow execution expired for workflow_execution_id: {wf_execution.id}")
            update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
            continue
        wf_execution_logs = get_db_workflow_execution_logs(account, wf_execution.id)
        if interval and wf_execution_logs:
            latest_wf_execution_log = wf_execution_logs.first()
            next_schedule = latest_wf_execution_log.created_at + timedelta(seconds=interval)
            if current_time_utc < next_schedule:
                logger.info(f"Workflow execution already scheduled for workflow_execution_id: {wf_execution.id}")
                continue

        update_db_account_workflow_execution_count_increment(account, wf_execution.id)
        if wf_execution.status == WorkflowExecutionStatusType.WORKFLOW_SCHEDULED:
            update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                        WorkflowExecutionStatusType.WORKFLOW_RUNNING)
        time_range = wf_execution.time_range
        all_pbs = wf_execution.workflow.playbooks.filter(is_active=True)
        all_playbook_ids = [pb.id for pb in all_pbs]
        for pb_id in all_playbook_ids:
            try:
                playbook_run_uuid = f'{str(current_time)}_{account.id}_{pb_id}_pb_run'
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
        if not interval:
            logger.info(
                f"Workflow execution interval not set for workflow_execution_id, marking complete: {wf_execution.id}")
            update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
            continue


workflow_scheduler_prerun_notifier = publish_pre_run_task(workflow_scheduler)
workflow_scheduler_failure_notifier = publish_task_failure(workflow_scheduler)
workflow_scheduler_postrun_notifier = publish_post_run_task(workflow_scheduler)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_executor(account_id, workflow_id, workflow_execution_id, playbook_id, playbook_execution_id, time_range):
    current_time = current_datetime().timestamp()
    logger.info(f"Running workflow execution:: account_id: {account_id}, workflow_execution_id: "
                f"{workflow_execution_id}, playbook_execution_id: {playbook_execution_id}")
    try:
        create_workflow_execution_log(account_id, workflow_id, workflow_execution_id, playbook_execution_id)
        execute_playbook(account_id, playbook_id, playbook_execution_id, time_range)
        try:
            saved_task = get_or_create_task(workflow_action_execution.__name__, account_id, workflow_id,
                                            workflow_execution_id, playbook_execution_id)
            if not saved_task:
                logger.error(f"Failed to create workflow action execution task for account: {account_id}, workflow_id: "
                             f"{workflow_id}, workflow_execution_id: {workflow_execution_id}, playbook_id: "
                             f"{playbook_id}")
                return
            task = workflow_action_execution.delay(account_id, workflow_id, workflow_execution_id,
                                                   playbook_execution_id)
            task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                              status=PeriodicTaskStatus.SCHEDULED,
                                              account_id=account_id,
                                              scheduled_at=datetime.fromtimestamp(float(current_time)))
        except Exception as e:
            logger.error(
                f"Failed to create workflow action execution:: workflow_id: {workflow_id}, workflow_execution_id: "
                f"{workflow_execution_id} playbook_id: {playbook_id}, error: {e}")
    except Exception as exc:
        logger.error(f"Error occurred while running workflow execution: {exc}")
        raise exc


workflow_executor_prerun_notifier = publish_pre_run_task(workflow_executor)
workflow_executor_failure_notifier = publish_task_failure(workflow_executor)
workflow_executor_postrun_notifier = publish_post_run_task(workflow_executor)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_action_execution(account_id, workflow_id, workflow_execution_id, playbook_execution_id):
    logger.info(f"Running workflow action execution:: account_id: {account_id}, workflow_execution_id: "
                f"{workflow_execution_id}, playbook_execution_id: {playbook_execution_id}")
    account = Account.objects.get(id=account_id)
    try:
        workflow_executions = get_db_workflow_executions(account, workflow_execution_id)
        playbook_executions = get_db_playbook_execution(account, playbook_execution_id=playbook_execution_id)
        workflows = get_db_workflows(account, workflow_id=workflow_id)
        if not workflow_executions:
            logger.error(f"Aborting workflow action execution as workflow execution not found for "
                         f"account_id: {account_id}, workflow_execution_id: {workflow_execution_id}")
        if not playbook_executions:
            logger.error(f"Aborting workflow action execution as playbook execution not found for "
                         f"account_id: {account_id}, playbook_execution_id: {playbook_execution_id}")
        if not workflows:
            logger.error(f"Aborting workflow action execution as workflow not found for "
                         f"account_id: {account_id}, workflow_id: {workflow_id}")

        thread_ts = None
        workflow_execution = workflow_executions.first()
        if workflow_execution.metadata:
            thread_ts = workflow_execution.metadata.get('thread_ts', None)

        playbook_execution = playbook_executions.first()
        pe_proto: PlaybookExecutionProto = playbook_execution.proto
        pe_logs = pe_proto.logs
        execution_output: [InterpretationProto] = playbook_execution_result_interpret(InterpreterType.BASIC_I, pe_logs)
        workflow = workflows.first()
        w_proto: WorkflowProto = workflow.proto
        w_actions = w_proto.actions
        for w_action in w_actions:
            if w_action.type == WorkflowActionProto.Type.NOTIFY and w_action.notification_config and \
                    w_action.notification_config.type == WorkflowActionNotificationConfig.Type.SLACK and \
                    w_action.notification_config.slack_config.message_type == WorkflowActionSlackNotificationConfig.MessageType.THREAD_REPLY:
                w_action_dict = proto_to_dict(w_action)
                slack_config_dict = w_action_dict.get('notification_config', {}).get('slack_config', {})
                slack_config_dict['thread_ts'] = thread_ts
                w_actions = dict_to_proto(w_action_dict, WorkflowActionProto)
            action_executor(account, w_action, execution_output)
    except Exception as exc:
        logger.error(f"Error occurred while running workflow action execution: {exc}")
        raise exc


workflow_action_execution_prerun_notifier = publish_pre_run_task(workflow_action_execution)
workflow_action_execution_failure_notifier = publish_task_failure(workflow_action_execution)
workflow_action_execution_postrun_notifier = publish_post_run_task(workflow_action_execution)
