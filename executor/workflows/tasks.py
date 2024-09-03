import logging
import uuid

from datetime import timedelta, datetime, timezone
from celery import shared_task
from django.conf import settings

from accounts.models import Account
from connectors.crud.connectors_crud import get_db_connector_keys, get_db_connectors

from executor.crud.playbook_execution_crud import create_playbook_execution, get_db_playbook_execution
from executor.crud.playbooks_crud import get_db_playbooks
from executor.source_processors.lambda_function_processor import LambdaFunctionProcessor
from executor.tasks import execute_playbook
from executor.workflows.action.action_executor_facade import action_executor_facade
from executor.workflows.action.smtp_email_executor import generate_email_body
from executor.workflows.crud.workflow_execution_crud import get_db_workflow_executions, \
    update_db_account_workflow_execution_status, get_workflow_executions, create_workflow_execution_log, \
    update_db_account_workflow_execution_latest_scheduled_at
from executor.workflows.crud.workflow_execution_utils import get_next_workflow_execution, WorkflowExpiredException
from executor.workflows.crud.workflows_crud import get_db_workflows
from executor.source_processors.slack_api_processor import SlackApiProcessor
from intelligence_layer.result_interpreters.result_interpreter_facade import playbook_step_execution_result_interpret
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.playbooks.playbook_pb2 import PlaybookExecution, Playbook
from protos.playbooks.source_task_definitions.lambda_function_task_pb2 import Lambda
from utils.logging_utils import log_function_call
from utils.time_utils import current_datetime, current_epoch_timestamp, epoch_to_string
from protos.base_pb2 import TimeRange, SourceKeyType
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto
from protos.playbooks.workflow_pb2 import WorkflowExecutionStatusType, Workflow as WorkflowProto, \
    WorkflowAction as WorkflowActionProto, WorkflowConfiguration as WorkflowConfigurationProto, \
    WorkflowExecution as WorkflowExecutionProto, WorkflowSchedule as WorkflowScheduleProto, \
    WorkflowEntryPoint as WorkflowEntryPointProto, WorkflowConfiguration
from protos.base_pb2 import Source
from google.protobuf.wrappers_pb2 import StringValue

from utils.proto_utils import dict_to_proto, proto_to_dict
from utils.uri_utils import build_absolute_uri

logger = logging.getLogger(__name__)


def get_entry_point_type_text(entry_point):
    if entry_point.type == WorkflowEntryPointProto.Type.SLACK_CHANNEL_ALERT:
        return "Slack Alert"
    elif entry_point.type == WorkflowEntryPointProto.Type.PAGERDUTY_INCIDENT:
        return "PagerDuty Incident"
    elif entry_point.type == WorkflowEntryPointProto.Type.ROOTLY_INCIDENT:
        return "Rootly Incident"
    elif entry_point.type == WorkflowEntryPointProto.Type.ZENDUTY_INCIDENT:
        return "Zenduty Incident"
    elif entry_point.type == WorkflowEntryPointProto.Type.API:
        return "API"
    else:
        return "UNKNOWN"


def get_action_type_text(action):
    destination_type = action.type
    if destination_type == WorkflowActionProto.Type.SLACK_MESSAGE:
        return "Slack"
    elif destination_type == WorkflowActionProto.Type.SLACK_THREAD_REPLY:
        return "Slack Thread"
    elif destination_type == WorkflowActionProto.Type.MS_TEAMS_MESSAGE_WEBHOOK:
        return "Teams"
    elif destination_type == WorkflowActionProto.Type.PAGERDUTY_NOTES:
        return "Pagerduty"
    elif destination_type == WorkflowActionProto.Type.ROOTLY_TIMELINE_EVENTS:
        return "Rootly"
    elif destination_type == WorkflowActionProto.Type.ZENDUTY_NOTES:
        return "Zenduty"
    elif destination_type == WorkflowActionProto.Type.SMTP_EMAIL:
        return "Email"
    else:
        return "UNKNOWN"


@shared_task(max_retries=3, default_retry_delay=10)
def workflow_scheduler():
    current_time_utc = current_datetime()
    current_time = int(current_time_utc.timestamp())

    all_scheduled_running_wf_executions = get_workflow_executions(
        status_in=[WorkflowExecutionStatusType.WORKFLOW_SCHEDULED, WorkflowExecutionStatusType.WORKFLOW_RUNNING]
    )

    for db_wfe in all_scheduled_running_wf_executions:
        account = db_wfe.account
        wf_execution: WorkflowExecutionProto = db_wfe.proto_max

        workflow_id = wf_execution.workflow.id.value
        logger.info(f"Scheduling Execution:: workflow_run_id: {wf_execution.workflow_run_id.value}, workflow_id: "
                    f"{workflow_id} at {current_time}")

        if wf_execution.status in [WorkflowExecutionStatusType.WORKFLOW_CANCELLED,
                                   WorkflowExecutionStatusType.WORKFLOW_FAILED,
                                   WorkflowExecutionStatusType.WORKFLOW_FINISHED]:
            logger.info(f"Execution terminated for workflow_run_id: {wf_execution.workflow_run_id.value}, "
                        f"workflow_id: {workflow_id} at {current_time}")
            continue

        scheduled_at = datetime.fromtimestamp(float(wf_execution.scheduled_at))
        scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)

        latest_scheduled_at = datetime.fromtimestamp(float(wf_execution.latest_scheduled_at))
        latest_scheduled_at = latest_scheduled_at.replace(tzinfo=timezone.utc)
        if current_time_utc < latest_scheduled_at:
            logger.info(
                f"Execution not yet scheduled for workflow_run_id: {wf_execution.workflow_run_id.value}, "
                f"workflow_id: {workflow_id} at {current_time_utc}")
            continue

        wfe_expiry_at = wf_execution.expiry_at if wf_execution.expiry_at else 0
        wfe_keep_alive = wf_execution.keep_alive.value if wf_execution.keep_alive else False
        if not wfe_keep_alive and wfe_expiry_at:
            expiry_at = datetime.fromtimestamp(float(wf_execution.expiry_at))
            expiry_at = expiry_at.replace(tzinfo=timezone.utc)
            if current_time_utc > expiry_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL)):
                logger.info(f"Execution expired for workflow_run_id: {wf_execution.workflow_run_id.value}, "
                            f"workflow_id: {workflow_id} at {current_time}")
                update_db_account_workflow_execution_status(account, wf_execution.id.value,
                                                            WorkflowExecutionStatusType.WORKFLOW_FINISHED)
                continue

        update_db_account_workflow_execution_status(account, wf_execution.id.value,
                                                    WorkflowExecutionStatusType.WORKFLOW_RUNNING)
        all_pbs: [Playbook] = wf_execution.workflow.playbooks
        execution_configuration: WorkflowConfiguration = wf_execution.execution_configuration
        execution_metadata: WorkflowExecutionProto.WorkflowExecutionMetadata = wf_execution.metadata
        for pb in all_pbs:
            pb_id = pb.id.value
            execution_global_variable_set = pb.global_variable_set
            try:
                uuid_str = uuid.uuid4().hex
                playbook_run_uuid = f'{str(current_time)}_{account.id}_{pb_id}_pb_run_{uuid_str}'
                if execution_configuration.global_variable_set.items():
                    execution_global_variable_set.update(execution_configuration.global_variable_set)

                if execution_metadata.event_context.items():
                    execution_global_variable_set.update(execution_metadata.event_context)

                execution_global_variable_set_dict = {}
                if execution_global_variable_set and execution_global_variable_set.items():
                    execution_global_variable_set_dict = proto_to_dict(execution_global_variable_set)

                playbook_execution = create_playbook_execution(account, wf_execution.time_range, pb_id,
                                                               playbook_run_uuid, wf_execution.created_by.value,
                                                               execution_global_variable_set_dict)

                workflow_execution_configuration = proto_to_dict(execution_configuration)
                time_range = proto_to_dict(wf_execution.time_range)

                saved_task = get_or_create_task(workflow_executor.__name__, account.id, workflow_id,
                                                wf_execution.id.value, pb_id, playbook_execution.id, time_range,
                                                workflow_execution_configuration)
                if not saved_task:
                    logger.error(f"Failed to create workflow execution task for account: {account.id}, workflow_id: "
                                 f"{workflow_id}, workflow_run_id: {wf_execution.workflow_run_id.value}, playbook_id: {pb_id}")
                    continue
                logger.info("workflow_execution_configuration in scheduler", workflow_execution_configuration)
                task = workflow_executor.delay(account.id, workflow_id, wf_execution.id.value, pb_id,
                                               playbook_execution.id, time_range, workflow_execution_configuration)
                task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                  status=PeriodicTaskStatus.SCHEDULED,
                                                  account_id=account.id,
                                                  scheduled_at=datetime.fromtimestamp(float(current_time)))
            except Exception as e:
                logger.error(f"Failed to create playbook execution:: workflow_id: {workflow_id}, workflow_run_id:"
                             f" {wf_execution.workflow_run_id.value} playbook_id: {pb_id}, error: {e}")
                update_db_account_workflow_execution_status(account, wf_execution.id.value,
                                                            WorkflowExecutionStatusType.WORKFLOW_FAILED)
                continue
        try:
            latest_scheduled_at, _, _ = get_next_workflow_execution(wf_execution.workflow.schedule, scheduled_at,
                                                                    latest_scheduled_at)
            update_db_account_workflow_execution_latest_scheduled_at(account, wf_execution.id.value,
                                                                     latest_scheduled_at)
        except WorkflowExpiredException as e:
            logger.error(f"Execution expired: {e} for workflow: {workflow_id}")
            update_db_account_workflow_execution_status(account, wf_execution.id.value,
                                                        WorkflowExecutionStatusType.WORKFLOW_FINISHED)
        except Exception as e:
            logger.error(f"Error in calculating next Execution: {e} for workflow: {workflow_id}")
            update_db_account_workflow_execution_status(account, wf_execution.id.value,
                                                        WorkflowExecutionStatusType.WORKFLOW_FAILED)


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
        if workflow_config.generate_summary and workflow_config.generate_summary.value:
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
        rootly_incident_id = None
        zd_incident_number = None

        if workflow_execution.metadata:
            slack_thread_ts = workflow_execution.metadata.get('event', {}).get('event', {}).get('ts', None)
            pd_incident_id = workflow_execution.metadata.get('incident_id', None)
            rootly_incident_id = workflow_execution.metadata.get('event', {}).get('incident_id', None)
            zd_incident_number = workflow_execution.metadata.get('event', {}).get('incident_id', None)

        playbook_execution = playbook_executions.first()
        pe_proto: PlaybookExecution = playbook_execution.proto
        step_execution_logs = pe_proto.step_execution_logs
        we_proto: WorkflowExecutionProto = workflow_execution.proto_max

        execution_output: [InterpretationProto] = []
        workflow_interpreter = workflow_definition_interpreter(we_proto, pe_proto)
        execution_output.append(workflow_interpreter)
        execution_output.extend(playbook_step_execution_result_interpret(step_execution_logs))

        pdf_file = ''
        # if we_proto.execution_configuration.generate_summary.value:
        #     pdf_file = generate_pdf(execution_output)
        #     logger.info(f"PDF file generated: {pdf_file}")
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
            elif w_action.type == WorkflowActionProto.Type.ROOTLY_TIMELINE_EVENTS:
                if not rootly_incident_id:
                    logger.error(f"Rootly incident id not found for workflow_execution_id: {workflow_execution_id}")
                    continue
                w_action_dict = proto_to_dict(w_action)
                w_action_dict['rootly_timeline_events'] = {'incident_id': rootly_incident_id}
                updated_w_action = dict_to_proto(w_action_dict, WorkflowActionProto)
                action_executor_facade.execute(updated_w_action, execution_output)
            elif w_action.type == WorkflowActionProto.Type.ZENDUTY_NOTES:
                if not zd_incident_number:
                    logger.error(f"Zenduty incident id not found for workflow_execution_id: {workflow_execution_id}")
                    continue
                w_action_dict = proto_to_dict(w_action)
                w_action_dict['zenduty_notes'] = {'incident_number': int(zd_incident_number)}
                updated_w_action = dict_to_proto(w_action_dict, WorkflowActionProto)
                action_executor_facade.execute(updated_w_action, execution_output)
            elif w_action.type == WorkflowActionProto.Type.SMTP_EMAIL:
                w_action_dict = proto_to_dict(w_action)
                w_action_dict['smtp_email']['body'] = generate_email_body(execution_output)
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
    elif message_type == WorkflowActionProto.Type.SMTP_EMAIL:
        logger.info("Sending test email")
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

        pb_exec_location = settings.PLATFORM_PLAYBOOKS_EXECUTION_PAGE_LOCATION.format(
            p_proto.id.value, pe_proto.playbook_run_id.value)
        pb_exec_protocol = settings.PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL
        pb_exec_use_sites = settings.PLATFORM_PLAYBOOKS_PAGE_USE_SITE

        playbook_execution_url = build_absolute_uri(None, pb_exec_location, pb_exec_protocol, pb_exec_use_sites)

        step_execution_logs = pe_proto.step_execution_logs
        execution_output: [InterpretationProto] = playbook_step_execution_result_interpret(step_execution_logs)
        if workflow.actions[0].type == WorkflowActionProto.Type.SLACK_MESSAGE or workflow.actions[
            0].type == WorkflowActionProto.Type.SLACK_THREAD_REPLY:
            workflow_test_message = InterpretationProto(
                type=InterpretationProto.Type.TEXT,
                title=StringValue(value=f'Testing Workflow: "{workflow.name.value}"'),
                description=StringValue(
                    value=f'This is a sample run of <{playbook_execution_url}|{p_proto.name.value}> playbook.'),
                model_type=InterpretationProto.ModelType.WORKFLOW_EXECUTION
            )
        else:
            workflow_test_message = InterpretationProto(
                type=InterpretationProto.Type.TEXT,
                title=StringValue(value=f'Testing Workflow: "{workflow.name.value}"'),
                description=StringValue(
                    value=f'This is a sample run of [{p_proto.name.value}]({playbook_execution_url}) playbook.'),
                model_type=InterpretationProto.ModelType.WORKFLOW_EXECUTION
            )
        execution_output.insert(0, workflow_test_message)
        pdf_file = ''
        # if workflow.configuration.generate_summary.value == True:
        #     pdf_file = generate_pdf(execution_output)
        #     logger.info(f"PDF file generated: {pdf_file}")
        action_executor_facade.execute(workflow.actions[0], execution_output)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")


def test_workflow_transformer(lambda_function: Lambda.Function, event):
    try:
        lambda_function_processor = LambdaFunctionProcessor(lambda_function.definition.value,
                                                            lambda_function.requirements)
        event_dict = proto_to_dict(event)
        event_context = lambda_function_processor.execute(event_dict)
        return event_context
    except Exception as e:
        logger.error(f"Error occurred while running transformer lambda function: {e}")
        raise e


def workflow_definition_interpreter(workflow_execution: WorkflowExecutionProto,
                                    playbook_execution: PlaybookExecution) -> InterpretationProto:
    wf_entry_points: [WorkflowEntryPointProto] = workflow_execution.workflow.entry_points
    trigger_text = ''
    if len(wf_entry_points) == 1:
        trigger_text = get_entry_point_type_text(wf_entry_points[0])
    else:
        logger.info("Multiple entry points found for same workflow")

    destination_list = workflow_execution.workflow.actions
    destination_text = ''
    if len(destination_list) == 1:
        destination_text = get_action_type_text(destination_list[0])
    else:
        logger.info("Multiple destinations configured for same workflow")

    pb_exec_location = settings.PLATFORM_PLAYBOOKS_EXECUTION_PAGE_LOCATION.format(playbook_execution.playbook.id.value,
                                                                                  playbook_execution.playbook_run_id.value)
    pb_exec_protocol = settings.PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL
    pb_exec_use_sites = settings.PLATFORM_PLAYBOOKS_PAGE_USE_SITE
    playbook_execution_url = build_absolute_uri(None, pb_exec_location, pb_exec_protocol, pb_exec_use_sites)

    workflow_id = workflow_execution.workflow.id.value
    wf_location = settings.PLATFORM_WORKFLOWS_PAGE_LOCATION.format(workflow_id)
    wf_protocol = settings.PLATFORM_WORKFLOWS_PAGE_SITE_HTTP_PROTOCOL
    wf_use_sites = settings.PLATFORM_WORKFLOWS_PAGE_USE_SITE
    workflow_url = build_absolute_uri(None, wf_location, wf_protocol, wf_use_sites)

    workflow_run_id = workflow_execution.workflow_run_id.value
    wf_exec_location = settings.PLATFORM_WORKFLOWS_EXECUTION_PAGE_LOCATION.format(workflow_run_id)
    workflow_execution_url = build_absolute_uri(None, wf_exec_location, wf_protocol, wf_use_sites)

    # Check if the execution is the first run of the scheduled workflow
    schedule_type = workflow_execution.workflow.schedule.type
    scheduled_time = workflow_execution.scheduled_at
    created_at = workflow_execution.created_at
    if schedule_type == WorkflowScheduleProto.Type.INTERVAL and scheduled_time - created_at < 15:
        is_first_run = True
    elif schedule_type == WorkflowScheduleProto.Type.CRON and scheduled_time - created_at < 15:
        is_first_run = True
    else:
        is_first_run = False
    time = scheduled_time

    workflow_summary_generation = workflow_execution.workflow.configuration.generate_summary.value
    workflow_name = workflow_execution.workflow.name.value
    if trigger_text == "UNKNOWN" or destination_text == "UNKNOWN":
        logger.info("Invalid trigger or destination type.")
        return InterpretationProto()
    if trigger_text == 'API' and destination_text in ['Slack thread', 'Pagerduty']:
        logger.info("Incorrect Format Type. API output cannot be in a Slack Thread or to PagerDuty")
        return InterpretationProto()
    if trigger_text == "PagerDuty Incident" and destination_text != "Pagerduty":
        logger.info("Incorrect Format Type. PagerDuty Incident output can only be to PagerDuty")
        return InterpretationProto()
    if trigger_text == "Zenduty Incident" and destination_text != "Zenduty":
        logger.info("Incorrect Format Type. Zenduty Incident output can only be to Zenduty")
        return InterpretationProto()
    if destination_text == "Pagerduty" and trigger_text != "PagerDuty Incident":
        logger.info("Incorrect Format Type. PagerDuty output can only be from PagerDuty Incident")
        return InterpretationProto()
    if trigger_text == "Rootly Incident" and destination_text != "Rootly":
        logger.info("Incorrect Format Type. Rootly Incident output can only be to Rootly")
        return InterpretationProto()
    if destination_text == "Rootly" and trigger_text != "Rootly Incident":
        logger.info("Incorrect Format Type. Rootly output can only be from Rootly Incident")
        return InterpretationProto()

    playbook_name = playbook_execution.playbook.name.value
    # time in minutes difference between now and scheduled time
    time_since_triggered = int((current_epoch_timestamp() - created_at) / 60) + 1
    string_time = epoch_to_string(time)
    string_created_time = epoch_to_string(created_at)
    if workflow_summary_generation:
        execution_time_block = f"\n Execution time: {string_time};"
    else:
        execution_time_block = ""
    if time_since_triggered == 1:
        execution_trigger_time_block = f"Triggered by: {trigger_text}, {time_since_triggered} minute ago."
    else:
        execution_trigger_time_block = f"Triggered by: {trigger_text}, {time_since_triggered} minutes ago."
    if destination_text in ['Slack', 'Slack Thread']:
        if schedule_type == WorkflowScheduleProto.Type.ONE_OFF:
            workflow_text = f"""Investigation PlayBook link: <{playbook_execution_url}|{playbook_name}> \n {execution_time_block} \n {execution_trigger_time_block} \n Configuration: <{workflow_url}|{workflow_name}>\n"""
        elif schedule_type == WorkflowScheduleProto.Type.INTERVAL or schedule_type == WorkflowScheduleProto.Type.CRON:
            if is_first_run:
                workflow_text = f"""Investigation PlayBook link: <{playbook_execution_url}|{playbook_name}> \n {execution_time_block} \n Triggered by: {trigger_text} at {string_created_time}. \n Configuration: <{workflow_url}|{workflow_name}> \n"""
            else:
                workflow_text = f"""Investigation PlayBook link: <{playbook_execution_url}|{playbook_name}> \n {execution_time_block} \n Triggered by: {trigger_text}. \n See workflow history: <{workflow_execution_url}|{workflow_name}> \n"""
    else:
        if schedule_type == WorkflowScheduleProto.Type.ONE_OFF:
            workflow_text = f"""Investigation PlayBook link: [{playbook_name}]({playbook_execution_url}) \n {execution_time_block} \n {execution_trigger_time_block} \n Configuration: [{workflow_name}]({workflow_url}) \n"""
        elif schedule_type == WorkflowScheduleProto.Type.INTERVAL or schedule_type == WorkflowScheduleProto.Type.CRON:
            if is_first_run:
                workflow_text = f"""Investigation PlayBook link: [{playbook_name}]({playbook_execution_url}) \n {execution_time_block} \n Triggered by: {trigger_text} at {string_created_time}. \n Configuration: [{workflow_name}]({workflow_url}) \n"""
            else:
                workflow_text = f"""Investigation PlayBook link: [{playbook_name}]({playbook_execution_url}) \n {execution_time_block} \n Triggered by: {trigger_text}. \n See workflow history: [{workflow_name}]({workflow_execution_url}) \n"""

    workflow_interpretation: InterpretationProto = InterpretationProto(type=InterpretationProto.Type.TEXT,
                                                                       description=StringValue(value=workflow_text),
                                                                       model_type=InterpretationProto.ModelType.WORKFLOW_EXECUTION)
    return workflow_interpretation
