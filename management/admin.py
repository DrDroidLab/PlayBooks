from django.contrib import admin

from management.models import Task, TaskRun


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "task",
        "max_retries",
        "retry_deadline",
        "created_at",
        "updated_at",
    ]
    list_filter = ("task",)


@admin.register(TaskRun)
class TaskRunAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "task",
        "task_uuid",
        "result",
        "status",
        "scheduled_at",
        "started_at",
        "completed_at",
    ]
    list_filter = ("task", "task_uuid", "result", "status",)
