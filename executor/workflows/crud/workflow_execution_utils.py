import logging
from datetime import timedelta

import uuid
from typing import Dict

from google.protobuf.struct_pb2 import Struct

from django.conf import settings

from accounts.models import Account
from executor.source_processors.lambda_function_processor import LambdaFunctionProcessor
from executor.workflows.crud.workflow_entry_point_crud import get_db_workflow_entry_point_mappings
from executor.workflows.crud.workflow_execution_crud import create_workflow_execution
from protos.playbooks.source_task_definitions.lambda_function_task_pb2 import Lambda
from protos.playbooks.workflow_schedules.cron_schedule_pb2 import CronSchedule
from protos.playbooks.workflow_schedules.interval_schedule_pb2 import IntervalSchedule
from utils.time_utils import calculate_next_cron_time, current_datetime, calculate_next_interval_time
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowSchedule, Workflow, WorkflowExecution, WorkflowConfiguration

from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


class WorkflowExpiredException(Exception):
    pass


def get_next_workflow_execution(schedule: WorkflowSchedule, scheduled_at, last_scheduled_at=None):
    expiry_at = None
    keep_alive = False
    if schedule.type == WorkflowSchedule.Type.INTERVAL:
        interval_schedule: IntervalSchedule = schedule.interval
        interval = interval_schedule.interval_in_seconds.value
        if not interval:
            raise ValueError(f"Invalid Interval Schedule in workflow")
        if interval < 60:
            raise ValueError(f"Interval should be greater than 60 seconds in workflow")

        keep_alive = interval_schedule.keep_alive.value if interval_schedule.keep_alive.value else False
        if not keep_alive:
            duration_in_seconds = interval_schedule.duration_in_seconds.value
            if not duration_in_seconds:
                raise ValueError(f"Invalid Schedule Deadline for Interval Schedule in workflow")
            expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)

        latest_scheduled_at = calculate_next_interval_time(interval, scheduled_at, last_scheduled_at)
        if not keep_alive and expiry_at and latest_scheduled_at > expiry_at:
            raise WorkflowExpiredException(f"Next Scheduled At is greater than Workflow Expiry time for workflow")
    elif schedule.type == WorkflowSchedule.Type.CRON:
        cron_schedule: CronSchedule = schedule.cron
        cron_rule = cron_schedule.rule.value
        if not cron_rule:
            raise ValueError(f"Invalid Cron Rule for workflow")

        keep_alive = cron_schedule.keep_alive.value if cron_schedule.keep_alive.value else False
        if not keep_alive:
            duration_in_seconds = cron_schedule.duration_in_seconds.value
            if not duration_in_seconds:
                raise ValueError(f"Invalid Schedule Deadline for Cron Schedule in workflow")
            expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)

        try:
            latest_scheduled_at = calculate_next_cron_time(cron_rule, scheduled_at, last_scheduled_at)
        except Exception as e:
            raise ValueError(f"Error in calculating cron times: {e} for workflow")

        if not latest_scheduled_at:
            raise ValueError(f"No Schedules Found with Cron Rule: {cron_rule} for workflow")

        if not keep_alive and expiry_at and latest_scheduled_at > expiry_at:
            raise WorkflowExpiredException(f"Next Scheduled At is greater than Workflow Expiry time for workflow")
    elif schedule.type == WorkflowSchedule.Type.ONE_OFF:
        if last_scheduled_at:
            raise WorkflowExpiredException(f"One Off Schedule in workflow already executed")
        latest_scheduled_at = scheduled_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL))
        expiry_at = latest_scheduled_at
    else:
        raise ValueError(f'Received invalid Schedule Type for workflow')
    return latest_scheduled_at, expiry_at, keep_alive


def trigger_alert_entry_point_workflows(account_id, entry_point_id, triggered_by,
                                        alert_event_type: WorkflowExecution.WorkflowExecutionMetadata.Type,
                                        alert_event: Dict) -> (bool, str):
    try:
        account = Account.objects.get(id=account_id)
    except Account.DoesNotExist:
        return False, f'Account with id: {account_id} not found'
    current_time_utc = current_datetime()
    all_wf_mappings = get_db_workflow_entry_point_mappings(account_id=account_id, entry_point_id=entry_point_id,
                                                           is_active=True)
    for wfm in all_wf_mappings:
        workflow = wfm.workflow
        workflow_proto: Workflow = workflow.proto_partial
        uuid_str = uuid.uuid4().hex
        workflow_run_uuid = f'{str(int(current_time_utc.timestamp()))}_{account_id}_{workflow.id}_wf_run_{uuid_str}'

        event_context = None
        if alert_event_type in [WorkflowExecution.WorkflowExecutionMetadata.Type.SLACK_MESSAGE,
                                WorkflowExecution.WorkflowExecutionMetadata.Type.PAGER_DUTY_INCIDENT,
                                WorkflowExecution.WorkflowExecutionMetadata.Type.ROOTLY_INCIDENT,
                                WorkflowExecution.WorkflowExecutionMetadata.Type.ZENDUTY_INCIDENT]:
            wf_configuration: WorkflowConfiguration = workflow_proto.configuration
            if alert_event and wf_configuration.transformer_lambda_function:
                transformer_lambda_function: Lambda.Function = wf_configuration.transformer_lambda_function
                if transformer_lambda_function.definition.value:
                    lambda_function_processor = LambdaFunctionProcessor(transformer_lambda_function.definition.value,
                                                                        transformer_lambda_function.requirements)
                    event_context = lambda_function_processor.execute(alert_event)
                    if event_context and not isinstance(event_context, dict):
                        logger.error(
                            f"Invalid(non json) event context generated for workflow: {workflow_proto.id.value}")
                        continue
        if event_context:
            event_context = {f"${k}" if not k.startswith("$") else k: v for k, v in event_context.items()}
        execution_metadata = WorkflowExecution.WorkflowExecutionMetadata(
            type=alert_event_type,
            event=dict_to_proto(alert_event, Struct),
            event_context=dict_to_proto(event_context, Struct) if event_context else None
        )
        create_workflow_execution_util(account, workflow_proto, current_time_utc, workflow_run_uuid, triggered_by,
                                       execution_metadata)


def create_workflow_execution_util(account: Account, workflow: Workflow, scheduled_at, workflow_run_uuid,
                                   triggered_by=None, workflow_execution_metadata=None) -> (bool, str):
    execution_metadata = proto_to_dict(workflow_execution_metadata) if workflow_execution_metadata else None
    schedule = workflow.schedule
    try:
        latest_scheduled_at, expiry_at, keep_alive = get_next_workflow_execution(schedule, scheduled_at)
    except Exception as e:
        return False, f"Error in calculating next workflow execution: {e} for workflow: {workflow.id}"

    offset = 3600
    workflow_configuration: WorkflowConfiguration = workflow.configuration if workflow.configuration else WorkflowConfiguration()
    if workflow_configuration and workflow_configuration.evaluation_window_in_seconds.value:
        offset = workflow_configuration.evaluation_window_in_seconds.value

    time_range = TimeRange(time_geq=int(latest_scheduled_at.timestamp()) - offset,
                           time_lt=int(latest_scheduled_at.timestamp()))
    if schedule.type != WorkflowSchedule.Type.ONE_OFF and not expiry_at and not keep_alive:
        return False, f"Expiry time is required for non-keep alive workflows"

    workflow_execution = create_workflow_execution(account, time_range, workflow.id.value, workflow_run_uuid,
                                                   scheduled_at, latest_scheduled_at, expiry_at, keep_alive,
                                                   triggered_by, execution_metadata,
                                                   proto_to_dict(workflow_configuration))
    return workflow_execution, ''
