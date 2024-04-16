import hashlib
import logging

from management.models import TaskRun, PeriodicTaskStatus, Task

logger = logging.getLogger(__name__)


def get_fargs_dict(*args, **kwargs):
    return {'args': args, 'kwargs': kwargs}


def get_fargs_json_mds(fargs):
    return hashlib.md5(str(fargs).encode('utf-8')).hexdigest()


def get_or_create_task(task, *args, **kwargs):
    fargs = get_fargs_dict(*args, **kwargs)
    md5_farags = get_fargs_json_mds(fargs)
    try:
        saved_task, _ = Task.objects.get_or_create(task=task,
                                                   md5_fargs=md5_farags,
                                                   defaults={
                                                       'fargs': fargs,
                                                   })
    except Exception as e:
        logger.error(f'Error in get_or_create_task: {e}')
        return None
    return saved_task


def get_task_object(task_name, *args, **kwargs):
    fargs = get_fargs_dict(*args, **kwargs)
    md5_farags = get_fargs_json_mds(fargs)
    return Task(task=task_name, md5_fargs=md5_farags, fargs=fargs)


def bulk_create_task(tasks: [Task]):
    try:
        saved_task_list: [Task] = Task.objects.bulk_create(tasks, batch_size=100)
        return saved_task_list
    except Exception as e:
        logger.error(f'Error in bulk_create_task: {e}')
        return None


def check_scheduled_or_running_task_run_for_task(saved_task):
    return TaskRun.objects.filter(task=saved_task).filter(
        status__in=[PeriodicTaskStatus.SCHEDULED, PeriodicTaskStatus.RUNNING]).exists()


def check_scheduled_or_running_or_completed_task_run_for_task(saved_task):
    return TaskRun.objects.filter(task=saved_task).filter(
        status__in=[PeriodicTaskStatus.SCHEDULED, PeriodicTaskStatus.RUNNING, PeriodicTaskStatus.COMPLETED]).exists()


def exclude_tasks_with_scheduled_or_running_task_run(tasks: [Task]):
    db_task = Task.objects.using('replica1').filter(task__in=tasks).exclude(
        taskrun__status__in=[PeriodicTaskStatus.SCHEDULED, PeriodicTaskStatus.RUNNING])
    return db_task


def create_task_run(**kwargs):
    try:
        task_run = TaskRun.objects.create(**kwargs)
        return task_run
    except Exception as e:
        logger.error(f'Error in create_task_run: {e}')
        return None


def bulk_create_task_run(task_run_list: [TaskRun]):
    try:
        saved_task_run_list: [TaskRun] = TaskRun.objects.bulk_create(task_run_list, batch_size=100)
        return saved_task_run_list
    except Exception as e:
        logger.error(f'Error in bulk_create_task_run: {e}')
        return None


def get_task_run_for_task_account_status(saved_task_list=None, task_name=None, task_fargs=None, account=None,
                                         status_list=None, batch_size=5) -> [TaskRun]:
    try:
        filters = {}
        if saved_task_list:
            filters['task__in'] = saved_task_list
        if task_name:
            filters['task__task'] = task_name
        if task_fargs:
            if 'kwargs' in task_fargs:
                for key, value in task_fargs['kwargs'].items():
                    filters[f'task__fargs__kwargs__{key}'] = value
            if 'args' in task_fargs:
                filters['task__fargs__args'] = task_fargs['args']
            filters['account'] = account
        if account:
            filters['account'] = account
        if status_list:
            filters['status__in'] = status_list
        if not filters:
            return []
        account_task_runs = TaskRun.objects.using('replica1').filter(**filters)
        account_task_runs = account_task_runs.select_related('task')
        return account_task_runs.order_by('-scheduled_at')[:batch_size]
    except Exception as e:
        logger.error(f'Error in get_task_run_for_task_account_status: {e}')
    return []
