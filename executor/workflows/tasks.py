import logging
from datetime import timedelta, datetime
import uuid

from celery import shared_task
from django.conf import settings

from accounts.models import Account
from connectors.crud.connectors_crud import get_db_connector_keys, get_db_connectors

from executor.crud.playbook_execution_crud import create_playbook_execution, get_db_playbook_execution
from executor.crud.playbooks_crud import get_db_playbooks
from executor.source_processors.lambda_function_processor import LambdaFunctionProcessor
from executor.tasks import execute_playbook
from executor.workflows.action.action_executor_facade import action_executor_facade
from executor.workflows.crud.workflow_execution_crud import get_db_workflow_executions, \
    update_db_account_workflow_execution_status, get_workflow_executions, create_workflow_execution_log
from executor.workflows.crud.workflows_crud import get_db_workflows
from executor.source_processors.slack_api_processor import SlackApiProcessor
from intelligence_layer.result_interpreters.result_interpreter_facade import playbook_step_execution_result_interpret
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.playbooks.playbook_pb2 import PlaybookExecution
from utils.time_utils import current_datetime, current_epoch_timestamp
from protos.base_pb2 import TimeRange, SourceKeyType
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType, Workflow as WorkflowProto, \
    WorkflowAction as WorkflowActionProto, WorkflowConfiguration as WorkflowConfigurationProto
from protos.base_pb2 import Source

from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_scheduler():
    current_time_utc = current_datetime()
    current_time = int(current_time_utc.timestamp())
    all_scheduled_wf_executions = get_workflow_executions(status=WorkflowExecutionStatusType.WORKFLOW_SCHEDULED)
    for wf_execution in all_scheduled_wf_executions:
        workflow_id = wf_execution.workflow_id
        workflow_execution_configuration = wf_execution.workflow_execution_configuration
        workflow_execution_metadata = wf_execution.metadata
        event_context = None
        if workflow_execution_metadata:
            if workflow_execution_metadata.get('type', '') in ['PAGER_DUTY_INCIDENT', 'SLACK_MESSAGE']:
                event = workflow_execution_metadata.get('event', {})
                if event and workflow_execution_configuration.get('transformer_lambda_function', None):
                    transformer_lambda_function = workflow_execution_configuration.get('transformer_lambda_function',
                                                                                       None)
                    lambda_function_processor = LambdaFunctionProcessor(transformer_lambda_function.get('executable'),
                                                                        transformer_lambda_function.get('requirements'))
                    event_context = lambda_function_processor.execute(event)
        logger.info(f"Scheduling workflow execution:: workflow_execution_id: {wf_execution.id}, workflow_id: "
                    f"{workflow_id} at {current_time}")
        account = wf_execution.account
        time_range = wf_execution.time_range
        update_time_range = None
        if wf_execution.status == WorkflowExecutionStatusType.WORKFLOW_CANCELLED:
            logger.info(f"Workflow execution cancelled for workflow_execution_id: {wf_execution.id}, workflow_id: "
                        f"{workflow_id} at {current_time}")
            continue

        scheduled_at = wf_execution.scheduled_at
        if current_time_utc < scheduled_at:
            logger.info(f"Workflow execution not scheduled yet for workflow_execution_id: {wf_execution.id}, "
                        f"workflow_id: {workflow_id} at {current_time}")
            continue

        expiry_at = wf_execution.expiry_at
        if current_time_utc > expiry_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL)):
            logger.info(f"Workflow execution expired for workflow_execution_id: {wf_execution.id}, workflow_id: "
                        f"{workflow_id} at {current_time}")
            update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
            continue

        update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                    WorkflowExecutionStatusType.WORKFLOW_RUNNING)
        all_pbs = wf_execution.workflow.playbooks.filter(workflowplaybookmapping__is_active=True)
        all_playbook_ids = [pb.id for pb in all_pbs]
        for pb_id in all_playbook_ids:
            try:
                uuid_str = uuid.uuid4().hex
                playbook_run_uuid = f'{str(current_time)}_{account.id}_{pb_id}_pb_run_{uuid_str}'
                if update_time_range:
                    time_range_proto = dict_to_proto(update_time_range, TimeRange)
                else:
                    time_range_proto = dict_to_proto(time_range, TimeRange)
                execution_global_variable_set = None
                if workflow_execution_configuration and 'global_variable_set' in workflow_execution_configuration:
                    execution_global_variable_set = workflow_execution_configuration['global_variable_set']
                    if event_context:
                        execution_global_variable_set.update(event_context)
                playbook_execution = create_playbook_execution(account, time_range_proto, pb_id, playbook_run_uuid,
                                                               wf_execution.created_by, execution_global_variable_set)
                saved_task = get_or_create_task(workflow_executor.__name__, account.id, workflow_id, wf_execution.id,
                                                pb_id, playbook_execution.id, time_range,
                                                workflow_execution_configuration)
                if not saved_task:
                    logger.error(f"Failed to create workflow execution task for account: {account.id}, workflow_id: "
                                 f"{workflow_id}, workflow_execution_id: {wf_execution.id}, playbook_id: {pb_id}")
                    continue
                logger.info("workflow_execution_configuration in scheduler", workflow_execution_configuration)
                task = workflow_executor.delay(account.id, workflow_id, wf_execution.id, pb_id, playbook_execution.id,
                                               time_range, workflow_execution_configuration)
                task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                  status=PeriodicTaskStatus.SCHEDULED,
                                                  account_id=account.id,
                                                  scheduled_at=datetime.fromtimestamp(float(current_time)))
            except Exception as e:
                logger.error(f"Failed to create playbook execution:: workflow_id: {workflow_id}, workflow_execution_id:"
                             f" {wf_execution.id} playbook_id: {pb_id}, error: {e}")
                update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                            WorkflowExecutionStatusType.WORKFLOW_FAILED)
                continue
            update_db_account_workflow_execution_status(account, wf_execution.id, scheduled_at,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
            continue


workflow_scheduler_prerun_notifier = publish_pre_run_task(workflow_scheduler)
workflow_scheduler_failure_notifier = publish_task_failure(workflow_scheduler)
workflow_scheduler_postrun_notifier = publish_post_run_task(workflow_scheduler)


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_executor(account_id, workflow_id, workflow_execution_id, playbook_id, playbook_execution_id, time_range,
                      workflow_execution_configuration):
    current_time = current_datetime().timestamp()
    logger.info(f"Running workflow execution:: account_id: {account_id}, workflow_execution_id: "
                f"{workflow_execution_id}, playbook_execution_id: {playbook_execution_id}")
    try:
        create_workflow_execution_log(account_id, workflow_id, workflow_execution_id, playbook_execution_id)
        workflow_config = WorkflowConfigurationProto()
        if workflow_execution_configuration:
            workflow_config = dict_to_proto(workflow_execution_configuration, WorkflowConfigurationProto)
        if workflow_config.generate_summary.value:
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
        workflows = get_db_workflows(account, workflow_id=workflow_id)
        workflow_executions = get_db_workflow_executions(account, workflow_execution_id)
        playbook_executions = get_db_playbook_execution(account, playbook_execution_id=playbook_execution_id)
        if not workflows:
            logger.error(f"Aborting workflow action execution as workflow not found for "
                         f"account_id: {account_id}, workflow_id: {workflow_id}")
        if not workflow_executions:
            logger.error(f"Aborting workflow action execution as workflow execution not found for "
                         f"account_id: {account_id}, workflow_execution_id: {workflow_execution_id}")
        if not playbook_executions:
            logger.error(f"Aborting workflow action execution as playbook execution not found for "
                         f"account_id: {account_id}, playbook_execution_id: {playbook_execution_id}")

        workflow_execution = workflow_executions.first()
        slack_thread_ts = None
        pd_incident_id = None
        if workflow_execution.metadata:
            slack_thread_ts = workflow_execution.metadata.get('thread_ts', None)
            pd_incident_id = workflow_execution.metadata.get('incident_id', None)

        playbook_execution = playbook_executions.first()
        pe_proto: PlaybookExecution = playbook_execution.proto
        p_proto = pe_proto.playbook
        step_execution_logs = pe_proto.step_execution_logs

        execution_output: [InterpretationProto] = playbook_step_execution_result_interpret(p_proto,
                                                                                           step_execution_logs)
        workflow = workflows.first()
        w_proto: WorkflowProto = workflow.proto
        w_actions = w_proto.actions
        for w_action in w_actions:
            if w_action.type == WorkflowActionProto.Type.SLACK_THREAD_REPLY:
                w_action_dict = proto_to_dict(w_action)
                w_action_dict['slack_thread_reply']['thread_ts'] = str(slack_thread_ts)
                updated_w_action = dict_to_proto(w_action_dict, WorkflowActionProto)
                action_executor_facade.execute(updated_w_action, execution_output)
            elif w_action.type == WorkflowActionProto.Type.PAGERDUTY_NOTES:
                if not pd_incident_id:
                    logger.error(f"Pagerduty incident id not found for workflow_execution_id: {workflow_execution_id}")
                    continue
                w_action_dict = proto_to_dict(w_action)
                w_action_dict['pagerduty_notes'] = {'incident_id': pd_incident_id}
                updated_w_action = dict_to_proto(w_action_dict, WorkflowActionProto)
                action_executor_facade.execute(updated_w_action, execution_output)
            else:
                action_executor_facade.execute(w_action, execution_output)
    except Exception as exc:
        logger.error(f"Error occurred while running workflow action execution: {exc}")
        raise exc


workflow_action_execution_prerun_notifier = publish_pre_run_task(workflow_action_execution)
workflow_action_execution_failure_notifier = publish_task_failure(workflow_action_execution)
workflow_action_execution_postrun_notifier = publish_post_run_task(workflow_action_execution)


def test_workflow_notification(user, account_id, workflow, message_type):
    try:
        account = Account.objects.get(id=account_id)
    except Exception as e:
        logger.error(f"Account not found for account_id: {account_id}, error: {e}")
        return
    current_time_epoch = current_epoch_timestamp()
    tr = TimeRange(time_lt=current_time_epoch, time_geq=current_time_epoch - 3600)
    playbook_id = workflow.playbooks[0].id.value
    playbooks = get_db_playbooks(account, playbook_id=playbook_id)
    if not playbooks:
        logger.error(f"Playbook not found for account_id: {account_id}, playbook_id: {playbook_id}")
        return
    playbook = playbooks.first()
    pb_proto = playbook.proto

    if message_type == WorkflowActionProto.Type.SLACK_THREAD_REPLY:
        logger.info("Sending test thread reply message")
        channel_id = workflow.entry_points[0].slack_channel_alert.slack_channel_id.value
        slack_connectors = get_db_connectors(account, connector_type=Source.SLACK, is_active=True)
        if not slack_connectors:
            logger.error(f"Active Slack connector not found for account_id: {account_id}")
            return

        slack_connector = slack_connectors.first()
        bot_auth_token_slack_connector_keys = get_db_connector_keys(account, slack_connector.id,
                                                                    key_type=SourceKeyType.SLACK_BOT_AUTH_TOKEN)
        if not bot_auth_token_slack_connector_keys:
            logger.error(f"Bot auth token not found for account_id: {account_id}")
            return

        bot_auth_token = bot_auth_token_slack_connector_keys.first().key
        message_ts = SlackApiProcessor(bot_auth_token).send_bot_message(channel_id,
                                                                        'Hello, this is a test alert message from the Playbooks Slack Droid to show how the enrichment works in reply to an alert.')
        workflow.actions[0].slack_thread_reply.thread_ts.value = message_ts
    elif message_type == WorkflowActionProto.Type.SLACK_MESSAGE:
        logger.info("Sending test message")
    elif message_type == WorkflowActionProto.Type.MS_TEAMS_MESSAGE_WEBHOOK:
        logger.info("Sending test MS Teams message")
    else:
        logger.error(f"Invalid message type: {message_type}")
        return

    try:
        current_time = current_epoch_timestamp()
        time_range = TimeRange(time_geq=int(current_time - 14400), time_lt=int(current_time))
        uuid_str = uuid.uuid4().hex
        playbook_run_uuid = f'{str(current_time)}_{account.id}_{playbook_id}_pb_run_{uuid_str}'

        playbook_execution = create_playbook_execution(account, time_range, playbook_id, playbook_run_uuid, user.email)

        if workflow.configuration.generate_summary and workflow.configuration.generate_summary.value:
            execute_playbook(account_id, playbook_id, playbook_execution.id, proto_to_dict(time_range))

        playbook_executions = get_db_playbook_execution(account, playbook_execution_id=playbook_execution.id)
        playbook_execution = playbook_executions.first()
        pe_proto: PlaybookExecution = playbook_execution.proto
        p_proto = pe_proto.playbook
        step_execution_logs = pe_proto.step_execution_logs
        execution_output: [InterpretationProto] = playbook_step_execution_result_interpret(p_proto,
                                                                                           step_execution_logs)

        action_executor_facade.execute(workflow.actions[0], execution_output)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
