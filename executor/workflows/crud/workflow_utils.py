from datetime import timedelta

from django.conf import settings
from google.protobuf.wrappers_pb2 import BoolValue, StringValue

from executor.workflows.crud.workflow_execution_crud import create_workflow_execution
from playbooks.utils.utils import calculate_cron_times
from protos.base_pb2 import Message, TaskCronRule, TimeRange
from protos.playbooks.api_pb2 import ExecuteWorkflowResponse
from protos.playbooks.workflow_pb2 import Workflow as WorkflowProto, WorkflowSchedule as WorkflowScheduleProto, \
    WorkflowPeriodicSchedule as WorkflowPeriodicScheduleProto


def create_workflow_execution_util_function(schedule_type, schedule, account, user_email, current_time_utc, workflow_id, workflow_run_uuid, metadata={}):
    if schedule_type == WorkflowScheduleProto.Type.PERIODIC:
        periodic_schedule: WorkflowPeriodicScheduleProto = schedule.periodic
        duration_in_seconds = periodic_schedule.duration_in_seconds.value
        expiry_at = current_time_utc + timedelta(seconds=duration_in_seconds)
        if periodic_schedule.type == WorkflowPeriodicScheduleProto.Type.INTERVAL:
            scheduled_at = current_time_utc
            interval = periodic_schedule.task_interval.interval_in_seconds.value
            if interval < 60:
                return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                                message=Message(title="Error", description="Invalid Interval"))
            time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                                    time_lt=int(scheduled_at.timestamp()))
            create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, expiry_at,
                                        interval, user_email, metadata)
        elif periodic_schedule.type == WorkflowPeriodicScheduleProto.Type.CRON:
            cron_rule: TaskCronRule = periodic_schedule.cron_rule.rule.value
            cron_schedules = calculate_cron_times(cron_rule, current_time_utc, expiry_at)
            if len(cron_schedules) == 0:
                return ExecuteWorkflowResponse(success=BoolValue(value=False),
                                                message=Message(title="Error",
                                                                description=f"No Schedules Found with Cron Rule: {cron_rule}"))
            for scheduled_at in cron_schedules:
                if scheduled_at > expiry_at:
                    break
                time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                                        time_lt=int(scheduled_at.timestamp()))
                create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at,
                                            scheduled_at, None, user_email, metadata)
    elif schedule_type == WorkflowScheduleProto.Type.ONE_OFF:
        scheduled_at = current_time_utc + timedelta(seconds=int(settings.WORKFLOW_SCHEDULER_INTERVAL))
        time_range = TimeRange(time_geq=int(scheduled_at.timestamp()) - 3600,
                                time_lt=int(scheduled_at.timestamp()))
        create_workflow_execution(account, time_range, workflow_id, workflow_run_uuid, scheduled_at, scheduled_at,
                                    None, user_email, metadata)