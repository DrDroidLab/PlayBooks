from celery import shared_task

from utils.time_utils import current_datetime

from connectors.models import integrations_connector_type_display_name_map
from connectors.assets.extractor.metadata_extractor import SourceMetadataExtractor
from connectors.assets.extractor.metadata_extractor_facade import source_metadata_extractor_facade

from management.crud.task_crud import get_or_create_task
from management.models import PeriodicTaskStatus, TaskRun
from management.utils.celery_task_signal_utils import publish_task_failure, publish_pre_run_task, publish_post_run_task


@shared_task(max_retries=3, default_retry_delay=10)
def populate_connector_metadata(account_id, connector_id, connector_type, connector_credentials_dict):
    try:
        extractor_class = source_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
    except Exception as e:
        print(
            f"Exception occurred while fetching extractor class for account: {account_id}, connector: {connector_id}, "
            f"connector_type: {integrations_connector_type_display_name_map.get(connector_type)}", str(e))
        return False
    extractor = extractor_class(**connector_credentials_dict, account_id=account_id, connector_id=connector_id)
    extractor_methods = [method for method in dir(extractor) if
                         callable(getattr(extractor, method)) and method not in dir(SourceMetadataExtractor)]
    for method in extractor_methods:
        print(f"Running method: {method} for account: {account_id}, connector: {connector_id}")
        try:
            current_time = current_datetime()
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
                                              scheduled_at=current_time)
        except Exception as e:
            print(f"Exception occurred while scheduling method: {method} for account: {account_id}, connector: "
                  f"{connector_id}, connector_type: {integrations_connector_type_display_name_map.get(connector_type)}",
                  str(e))
            continue


populate_connector_metadata_prerun_notifier = publish_pre_run_task(populate_connector_metadata)
populate_connector_metadata_failure_notifier = publish_task_failure(populate_connector_metadata)
populate_connector_metadata_postrun_notifier = publish_post_run_task(populate_connector_metadata)


@shared_task(max_retries=3, default_retry_delay=10)
def extractor_async_method_call(account_id, connector_id, connector_credentials_dict, connector_type, extractor_method):
    print(f"Running method: {extractor_method} for account: {account_id}, connector: {connector_id} and "
          f"connector_type: {integrations_connector_type_display_name_map.get(connector_type)}")
    extractor_class = source_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
    extractor = extractor_class(**connector_credentials_dict, account_id=account_id, connector_id=connector_id)
    method = getattr(extractor, extractor_method)
    try:
        method(save_to_db=True)
    except Exception as e:
        print(f"Exception occurred while running method: {extractor_method} for account: {account_id}, connector: "
              f"{connector_id}, connector_type: {integrations_connector_type_display_name_map.get(connector_type)}",
              str(e))
        return False
    return True


extractor_async_method_call_prerun_notifier = publish_pre_run_task(extractor_async_method_call)
extractor_async_method_call_failure_notifier = publish_task_failure(extractor_async_method_call)
extractor_async_method_call_postrun_notifier = publish_post_run_task(extractor_async_method_call)
