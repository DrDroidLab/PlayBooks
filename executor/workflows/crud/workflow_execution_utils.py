from datetime import timedelta

from django.conf import settings

from accounts.models import Account
from executor.workflows.crud.workflow_entry_point_crud import get_db_workflow_entry_point_mappings
from executor.workflows.crud.workflow_execution_crud import create_workflow_execution
from utils.time_utils import calculate_cron_times, current_datetime
from protos.base_pb2 import TaskCronRule, TimeRange
from protos.playbooks.workflow_pb2 import WorkflowSchedule as WorkflowScheduleProto, \
    WorkflowPeriodicSchedule as WorkflowPeriodicScheduleProto
from utils.proto_utils import dict_to_proto


def trigger_slack_alert_entry_point_workflows(account_id, entry_point_id, thread_ts) -> (bool, str):
    try:
        account = Account.objects.get(id=account_id)
    except Account.DoesNotExist:
        return False, f'Account with id: {account_id} not found'
    current_time_utc = current_datetime()
    all_wf_mappings = get_db_workflow_entry_point_mappings(account_id=account_id, entry_point_id=entry_point_id,
                                                           is_active=True)
    for wfm in all_wf_mappings:
        workflow = wfm.workflow
        workflow_run_id = f'{str(int(current_time_utc.timestamp()))}_{account_id}_{workflow.id}_wf_run'
        schedule: WorkflowScheduleProto = dict_to_proto(workflow.schedule, WorkflowScheduleProto)
        create_workflow_execution_util(account, workflow.id, workflow.schedule_type, schedule,
                                       current_time_utc, workflow_run_id, 'SLACK_ALERT', {'thread_ts': thread_ts})


def trigger_pagerduty_alert_entry_point_workflows(account_id, entry_point_id, incident_key) -> (bool, str):
    try:
        account = Account.objects.get(id=account_id)
    except Account.DoesNotExist:
        return False, f'Account with id: {account_id} not found'
    current_time_utc = current_datetime()
    all_wf_mappings = get_db_workflow_entry_point_mappings(account_id=account_id, entry_point_id=entry_point_id,
                                                           is_active=True)
    for wfm in all_wf_mappings:
        workflow = wfm.workflow
        workflow_run_id = f'{str(int(current_time_utc.timestamp()))}_{account_id}_{workflow.id}_wf_run'
        schedule: WorkflowScheduleProto = dict_to_proto(workflow.schedule, WorkflowScheduleProto)
        create_workflow_execution_util(account, workflow.id, workflow.schedule_type, schedule,
                                       current_time_utc, workflow_run_id, 'PAGER_DUTY_ALERT', {'incident_key': incident_key})


def create_workflow_execution_util(account: Account, workflow_id, schedule_type, schedule, scheduled_at,
                                   workflow_run_uuid, triggered_by=None, metadata=None) -> (bool, str):
    if schedule_type == WorkflowScheduleProto.Type.PERIODIC:
        periodic_schedule: WorkflowPeriodicScheduleProto = schedule.periodic
        duration_in_seconds = periodic_schedule.duration_in_seconds.value
        expiry_at = scheduled_at + timedelta(seconds=duration_in_seconds)
        if periodic_schedule.type == WorkflowPeriodicScheduleProto.Type.INTERVAL:
            interval = periodic_schedule.task_interval.interval_in_seconds.value
            if interval < 60:
                return False, "Invalid Interval"
            time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                                   time_lt=int(scheduled_at.timestamp()))
            create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, expiry_at,
                                      interval, triggered_by, metadata)
        elif periodic_schedule.type == WorkflowPeriodicScheduleProto.Type.CRON:
            cron_rule: TaskCronRule = periodic_schedule.cron_rule.rule.value
            cron_schedules = calculate_cron_times(cron_rule, scheduled_at, expiry_at)
            if len(cron_schedules) == 0:
                return False, f"No Schedules Found with Cron Rule: {cron_rule}"
            for scheduled_at in cron_schedules:
                if scheduled_at > expiry_at:
                    break
                time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                                       time_lt=int(scheduled_at.timestamp()))
                create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at,
                                          scheduled_at, None, triggered_by, metadata)
    elif schedule_type == WorkflowScheduleProto.Type.ONE_OFF:
        scheduled_at = scheduled_at + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL))
        time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                               time_lt=int(scheduled_at.timestamp()))
        create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, scheduled_at,
                                  None, triggered_by, metadata)
    else:
        return False, f'Invalid Schedule Type'
    return True, ''
