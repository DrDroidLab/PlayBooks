from enum import IntEnum
from hashlib import md5

from django.db import models

from accounts.models import Account


class PeriodicTaskStatus(IntEnum):
    UNKNOWN = 0
    SKIPPED = 1
    SCHEDULED = 2
    RUNNING = 3
    COMPLETED = 4
    FAILED = 5

    @classmethod
    def choices(cls):
        return [(key.value, key.name) for key in cls]


class PeriodicTaskResult(IntEnum):
    UNKNOWN = 0
    SUCCESS = 1
    FAILURE = 2

    @classmethod
    def choices(cls):
        return [(key.value, key.name) for key in cls]


class Task(models.Model):
    task = models.TextField(db_index=True)
    fargs = models.JSONField(null=True, blank=True)
    md5_fargs = models.CharField(max_length=256, null=True, blank=True, db_index=True)

    max_retries = models.IntegerField(default=0)
    retry_deadline = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True, db_index=True)

    class Meta:
        unique_together = [['task', 'md5_fargs']]

    def __str__(self):
        return f'{self.task}'

    def save(self, **kwargs):
        if self.fargs:
            self.md5_fargs = md5(str(self.fargs).encode('utf-8')).hexdigest()
        super().save(**kwargs)


class TaskRun(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    task_uuid = models.CharField(max_length=256, db_index=True)
    status = models.IntegerField(null=True, blank=True,
                                 choices=PeriodicTaskStatus.choices(),
                                 default=PeriodicTaskStatus.UNKNOWN,
                                 db_index=True)
    result = models.IntegerField(null=True, blank=True, choices=PeriodicTaskResult.choices(),
                                 default=PeriodicTaskResult.UNKNOWN, db_index=True)
    scheduled_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True, db_index=True)

    account = models.ForeignKey(Account, null=True, blank=True, on_delete=models.CASCADE, db_index=True)

    class Meta:
        unique_together = [['task', 'task_uuid']]

    def __str__(self):
        return f'{self.task}:{self.task_uuid}'
