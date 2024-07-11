import logging
from datetime import timedelta

import uuid
from struct import Struct

from django.conf import settings

from accounts.models import Account
from executor.workflows.crud.workflow_entry_point_crud import get_db_workflow_entry_point_mappings
from executor.workflows.crud.workflow_execution_crud import create_workflow_execution
from protos.playbooks.workflow_schedules.cron_schedule_pb2 import CronSchedule
from protos.playbooks.workflow_schedules.interval_schedule_pb2 import IntervalSchedule
from utils.time_utils import calculate_cron_times, current_datetime, calculate_interval_times
from protos.base_pb2 import TimeRange
from protos.playbooks.workflow_pb2 import WorkflowSchedule, Workflow, WorkflowExecution

from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


def trigger_slack_alert_entry_point_workflows(account_id, entry_point_id, slack_message) -> (bool, str):
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
        schedule: WorkflowSchedule = dict_to_proto(workflow.schedule, WorkflowSchedule)

        execution_metadata = WorkflowExecution.WorkflowExecutionMetadata(
            type=WorkflowExecution.WorkflowExecutionMetadata.Type.SLACK_MESSAGE,
            event=dict_to_proto(slack_message, Struct)
        )
        create_workflow_execution_util(account, workflow.id, workflow.schedule_type, schedule, current_time_utc,
                                       workflow_run_uuid, 'SLACK_ALERT', workflow_execution_metadata=execution_metadata,
                                       workflow_config=workflow_proto.configuration)


def trigger_pagerduty_alert_entry_point_workflows(account_id, entry_point_id, pager_duty_incident) -> \
        (bool, str):
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
        workflow_run_id = f'{str(int(current_time_utc.timestamp()))}_{account_id}_{workflow.id}_wf_run_{uuid_str}'
        schedule: WorkflowSchedule = dict_to_proto(workflow.schedule, WorkflowSchedule)

        execution_metadata = WorkflowExecution.WorkflowExecutionMetadata(
            type=WorkflowExecution.WorkflowExecutionMetadata.Type.PAGER_DUTY_INCIDENT,
            event=dict_to_proto(pager_duty_incident, Struct)
        )

        create_workflow_execution_util(account, workflow.id, workflow.schedule_type, schedule, current_time_utc,
                                       workflow_run_id, 'PAGERDUTY', workflow_execution_metadata=execution_metadata,
                                       workflow_config=workflow_proto.configuration)


def create_workflow_execution_util(account: Account, workflow_id, schedule_type, schedule, scheduled_at,
                                   workflow_run_uuid, triggered_by=None, workflow_execution_metadata=None,
                                   workflow_config=None) -> (bool, str):
    workflow_config_dict = proto_to_dict(workflow_config)
    metadata = proto_to_dict(workflow_execution_metadata) if workflow_execution_metadata else None
    if schedule_type == WorkflowSchedule.Type.INTERVAL:
        interval_schedule: IntervalSchedule = schedule.interval

        duration_in_seconds = interval_schedule.duration_in_seconds.value
        if not duration_in_seconds:
            return False, "Invalid Schedule Deadline"
        expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)

        interval = interval_schedule.interval_in_seconds.value
        if not interval or interval < 60:
            return False, "Invalid Interval"

        intervals = calculate_interval_times(interval, scheduled_at, expiry_at)
        if not intervals or len(intervals) == 0:
            return False, "No Intervals Found"

        for scheduled_at in intervals:
            if scheduled_at > expiry_at:
                break
            time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600, time_lt=int(scheduled_at.timestamp()))
            create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, expiry_at,
                                      triggered_by, metadata, workflow_config_dict)
    elif schedule_type == WorkflowSchedule.Type.CRON:
        cron_schedule: CronSchedule = schedule.cron
        cron_rule = cron_schedule.rule.value
        if not cron_rule:
            return False, "Invalid Cron Rule"

        duration_in_seconds = cron_schedule.duration_in_seconds.value
        if not duration_in_seconds:
            return False, "Invalid Schedule Deadline"
        expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)

        try:
            cron_schedules = calculate_cron_times(cron_rule, scheduled_at, expiry_at)
        except Exception as e:
            logger.error(f"Error in calculating cron times: {e}")
            return False, f"Error in calculating cron times: {e}"

        if not cron_schedules or len(cron_schedules) == 0:
            return False, f"No Schedules Found with Cron Rule: {cron_rule}"

        for scheduled_at in cron_schedules:
            if scheduled_at > expiry_at:
                break
            time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600, time_lt=int(scheduled_at.timestamp()))
            create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, scheduled_at,
                                      triggered_by, metadata, workflow_config_dict)
    elif schedule_type == WorkflowSchedule.Type.ONE_OFF:
        scheduled_at = scheduled_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL))
        time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600, time_lt=int(scheduled_at.timestamp()))
        create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, scheduled_at,
                                  triggered_by, metadata, workflow_config_dict)
    else:
        return False, f'Invalid Schedule Type'
    return True, ''
