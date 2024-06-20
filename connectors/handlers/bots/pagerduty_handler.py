import logging
import traceback
from typing import Dict
from datetime import datetime, timedelta

from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata, get_db_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from connectors.handlers.tasks import pagerduty_data_fetch_storage_job, pagerduty_handle_webhook_call
from executor.source_processors.pd_api_processor import PdApiProcessor
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from utils.time_utils import current_datetime
from protos.base_pb2 import Source, SourceModelType, SourceKeyType

logger = logging.getLogger(__name__)


def create_or_update_pagerduty_incident_metadata(account_id, connector_id, incident_id, title=None):
    try:
        metadata = {'title': title, 'pd_incident_id': incident_id}
        return create_or_update_model_metadata(account_id=account_id, connector_id=connector_id,
                                               connector_type=Source.PAGER_DUTY,
                                               model_type=SourceModelType.PAGERDUTY_INCIDENT,
                                               model_uid=incident_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(
            f"Error while saving PagerDutyIncidentMetadata: {connector_id}:{incident_id} with error: {e}")
        return None, False


def handle_pagerduty_incident(data: Dict):
    event = data.get('event')
    active_account_pagerduty_connectors = get_db_connectors(connector_type=Source.PAGER_DUTY, is_active=True)
    if not active_account_pagerduty_connectors:
        logger.error(f"Error handling pagerduty event callback api: active pagerduty connector not found")
        raise Exception("No active pagerduty connector found")

    pagerduty_connector = active_account_pagerduty_connectors.first()

    incident_status = event.get('data').get('status', '')

    if incident_status == 'triggered':
        try:
            pagerduty_handle_webhook_call.delay(pagerduty_connector.id, data)
        except Exception as e:
            logger.error(f"Error while handling pagerduty 'message' event with error: {e} for connector: {pagerduty_connector.id}")
            raise Exception("Error while handling pagerduty 'message' event")

    incident_id = event.get('data', {}).get('id', '')
    title = event.get('data').get('title', '')
    if not incident_id:
        logger.error(f"Error handling pagerduty event callback api: incident id not found in request data: {data}")
        raise Exception("Invalid data received")

    try:
        api_key = get_db_connector_keys(account_id=pagerduty_connector.account_id,
                                        connector_id=pagerduty_connector.id,
                                        key_type=SourceKeyType.PAGER_DUTY_API_KEY)
        if not api_key:
            logger.error(
                f"Error handling pagerduty event callback api: api key not found for connector {pagerduty_connector.id}")
            raise Exception("API key not found")

        api_key = api_key.first().key
        service_id = event.get('data').get('service').get('id')
        if service_id:
            service_name = event.get('data').get('service').get('summary')

        pagerduty_metadata, is_created = create_or_update_pagerduty_incident_metadata(
            account_id=pagerduty_connector.account_id,
            connector_id=pagerduty_connector.id,
            incident_id=incident_id, title=title)

        if pagerduty_metadata:
            try:
                saved_task = get_or_create_task(pagerduty_data_fetch_storage_job.__name__,
                                                pagerduty_connector.account_id,
                                                pagerduty_connector.id, pagerduty_metadata.id, incident_id,
                                                api_key, service_id)
                if not saved_task:
                    logger.error("Failed to create task for pagerduty incident fetch job")
                task = pagerduty_data_fetch_storage_job.delay(pagerduty_connector.account_id, pagerduty_connector.id,
                                                              pagerduty_metadata.id,
                                                              service_id, data)
                task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                  status=PeriodicTaskStatus.SCHEDULED,
                                                  account_id=pagerduty_connector.account_id
                                                  )
            except Exception as e:
                logger.error(f"Error while creating task for pagerduty incident fetch job with error: {e}")
                raise Exception("Error while creating task for pagerduty incident fetch job")
            return True
        else:
            logger.error(
                f"Error while saving PagerDutyIncidentMetadata for connector: {pagerduty_connector.id}:{incident_id}")
            return False

    except Exception as e:
        logger.error(
            f"Error while registering pagerduty incident metadata for connector: {pagerduty_connector.id} with error: {e}")
        return False
