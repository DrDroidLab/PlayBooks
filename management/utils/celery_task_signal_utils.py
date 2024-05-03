import logging

from celery.signals import task_prerun, task_postrun, task_failure

from management.models import TaskRun, PeriodicTaskStatus, PeriodicTaskResult
from utils.time_utils import current_datetime

logger = logging.getLogger(__name__)


def publish_pre_run_task(sender):
    @task_prerun.connect(sender=sender)
    def cron_task_pre_run_notifier(signal=None, sender=None, task_id=None, task=None, args=None, **kwargs):
        try:
            task_run = TaskRun.objects.filter(task_uuid=task_id).first()
            if task_run:
                task_run.status = PeriodicTaskStatus.RUNNING
                task_run.started_at = current_datetime()
                task_run.save(update_fields=['status', 'started_at'])
        except Exception as e:
            logger.error(f'Error in cron_task_pre_run_notifier: {e}')

    return cron_task_pre_run_notifier


def publish_post_run_task(sender):
    @task_postrun.connect(sender=sender)
    def cron_task_post_run_notifier(signal=None, sender=None, task_id=None, task=None, args=None, kwargs=None,
                                    retval=None, state=None, **extra_kwargs):
        try:
            task_run = TaskRun.objects.filter(task_uuid=task_id).first()
            if not task_run:
                return
            if state and state == 'FAILURE':
                task_run.result = PeriodicTaskResult.FAILURE
                task_run.status = PeriodicTaskStatus.FAILED
            else:
                task_run.result = PeriodicTaskResult.SUCCESS
                task_run.status = PeriodicTaskStatus.COMPLETED
            task_run.completed_at = current_datetime()
            task_run.save(update_fields=['result', 'status', 'completed_at'])
        except Exception as e:
            logger.error(f'Error in cron_task_post_run_notifier: {e}')

    return cron_task_post_run_notifier


def publish_task_success(sender):
    @task_postrun.connect(sender=sender)
    def cron_task_post_run_notifier(signal=None, sender=None, task_id=None, task=None, args=None, **kwargs):
        try:
            task_run = TaskRun.objects.filter(task_uuid=task_id).first()
            if task_run:
                task_run.result = PeriodicTaskResult.SUCCESS
                task_run.status = PeriodicTaskStatus.COMPLETED
                task_run.completed_at = current_datetime()
                task_run.save(update_fields=['result', 'status', 'completed_at'])
        except Exception as e:
            logger.error(f'Error in cron_task_post_run_notifier: {e}')

    return cron_task_post_run_notifier


def publish_task_failure(sender):
    @task_failure.connect(sender=sender)
    def cron_task_failure_notifier(signal=None, sender=None, task_id=None, task=None, args=None, **kwargs):
        try:
            task_run = TaskRun.objects.filter(task_uuid=task_id).first()
            if task_run:
                task_run.result = PeriodicTaskResult.FAILURE
                task_run.status = PeriodicTaskStatus.FAILED
                task_run.completed_at = current_datetime()
                task_run.save(update_fields=['result', 'status', 'completed_at'])
        except Exception as e:
            logger.error(f'Error in cron_task_failure_notifier: {e}')

    return cron_task_failure_notifier
