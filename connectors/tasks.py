from datetime import datetime

from celery import shared_task

from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from connectors.assets.extractor.metadata_extractor_facade import connector_metadata_extractor_facade
from management.crud.task_crud import get_or_create_task
from management.models import PeriodicTaskStatus, TaskRun
from management.utils.celery_task_signal_utils import publish_task_failure, publish_pre_run_task, publish_post_run_task
from playbooks.utils.utils import current_milli_time


@shared_task(max_retries=3, default_retry_delay=10)
def populate_connector_metadata(account_id, connector_id, connector_type, connector_credentials_dict):
    extractor_class = connector_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
    extractor = extractor_class(**connector_credentials_dict, account_id=account_id, connector_id=connector_id)
    extractor_methods = [method for method in dir(extractor) if
                         callable(getattr(extractor, method)) and method not in dir(ConnectorMetadataExtractor)]
    for method in extractor_methods:
        print(f"Running method: {method} for account: {account_id}, connector: {connector_id}")
        try:
            current_time = current_milli_time()
            saved_task = get_or_create_task(extractor_async_method_call.__name__, account_id, connector_id,
                                            connector_credentials_dict, connector_type, method)
            if not saved_task:
                print(f"Failed to create extractor_async_method_call task for account: {account_id}, connector: "
                      f"{connector_id}, connector_type: {connector_type}, method: {method}")
                continue
            task = extractor_async_method_call.delay(account_id, connector_id, connector_credentials_dict,
                                                     connector_type, method)
            task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                              status=PeriodicTaskStatus.SCHEDULED,
                                              account_id=account_id,
                                              scheduled_at=datetime.fromtimestamp(float(current_time)))
        except Exception as e:
            print(f"Exception occurred while running method: {method} for account: {account_id}, connector: "
                  f"{connector_id}, connector_type: {connector_type}, method: {method}")
            continue


populate_connector_metadata_prerun_notifier = publish_pre_run_task(populate_connector_metadata)
populate_connector_metadata_failure_notifier = publish_task_failure(populate_connector_metadata)
populate_connector_metadata_postrun_notifier = publish_post_run_task(populate_connector_metadata)


@shared_task(max_retries=3, default_retry_delay=10)
def extractor_async_method_call(account_id, connector_id, connector_credentials_dict, connector_type, extractor_method):
    extractor_class = connector_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
    extractor = extractor_class(**connector_credentials_dict, account_id=account_id, connector_id=connector_id)
    method = getattr(extractor, extractor_method)
    method(save_to_db=True)
    return True


extractor_async_method_call_prerun_notifier = publish_pre_run_task(extractor_async_method_call)
extractor_async_method_call_failure_notifier = publish_task_failure(extractor_async_method_call)
extractor_async_method_call_postrun_notifier = publish_post_run_task(extractor_async_method_call)
