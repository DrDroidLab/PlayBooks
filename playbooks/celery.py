from __future__ import absolute_import, unicode_literals

import logging
import os

from celery import Celery, shared_task

logger = logging.getLogger(__name__)

# Set the default Django settings mode for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playbooks.base_settings')

app = Celery('playbooks')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.update(task_routes={
    'executor.workflows.tasks.workflow_scheduler': {'queue': 'workflow_scheduler'},
    'executor.workflows.tasks.workflow_executor': {'queue': 'workflow_executor'},
    'executor.workflows.tasks.workflow_action_execution': {'queue': 'workflow_action_execution'},
})

app.conf.beat_schedule = {
    'workflow-scheduler-job-every-10-seconds': {
        'task': 'executor.workflows.tasks.workflow_scheduler',
        'schedule': 10.0,  # Run every 10 seconds
    },
}

app.autodiscover_tasks()


@shared_task
def debug_task():
    logger.info('Debug task executed')
