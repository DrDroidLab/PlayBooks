from __future__ import absolute_import, unicode_literals

import os

from celery import Celery, shared_task

# Set the default Django settings mode for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playbooks.base_settings')

app = Celery('playbooks')
app.config_from_object('django.conf:settings', namespace='CELERY')
# app.conf.update(task_routes={
#     'accounts.tasks.*': {'queue': 'account_management'},
# })
app.autodiscover_tasks()


@shared_task
def debug_task():
    print('Debug task executed')
