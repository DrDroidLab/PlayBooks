import logging
import traceback
from typing import Dict
from datetime import datetime, timedelta


from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata, get_db_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from connectors.handlers.tasks import pagerduty_data_fetch_storage_job
from executor.source_processors.pd_api_processor import PdApiProcessor
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from utils.time_utils import current_datetime
from protos.base_pb2 import Source, SourceModelType, SourceKeyType


logger = logging.getLogger(__name__)


def create_or_update_pagerduty_incident_metadata(account_id, account_pagerduty_connector_id, incident_id, event_ts, title=None):
    try:
        metadata = {'title': title, 'event_ts': event_ts}
        return create_or_update_model_metadata(account_id=account_id, connector_id=account_pagerduty_connector_id,
                                               connector_type=Source.PAGER_DUTY,
                                               model_type=SourceModelType.PAGERDUTY_INCIDENT,
                                               model_uid=incident_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(f"Error while saving PagerDutyIncidentMetadata: {account_pagerduty_connector_id}:{incident_id} with error: {e}")
        return None, False


def handle_pagerduty_event_callback(data: Dict):
    if 'event' not in data or 'id' not in data['event']:
        logger.error(f"Error handling PagerDuty event callback, 'event' or 'id' not found in request data: {data}")
        raise Exception("Invalid data received")

    event = data['event']
    incident_id = event['id']
    event_ts = event['incident_created_at']
    title = event.get('title', '')

    active_account_pagerduty_connectors = get_db_connectors(connector_type=Source.PAGER_DUTY, is_active=True)
    if not active_account_pagerduty_connectors:
        logger.error("Error handling PagerDuty event callback: active PagerDuty connector not found")
        raise Exception("No active PagerDuty connector found")

    pagerduty_connector = active_account_pagerduty_connectors.first()
    account_id = pagerduty_connector.account_id

    incident_model = get_db_connector_metadata_models(account_id=account_id,
                                                      connector_id=pagerduty_connector.id,
                                                      connector_type=Source.PAGER_DUTY,
                                                      model_type=SourceModelType.PAGERDUTY_INCIDENT,
                                                      model_uid=incident_id, is_active=True)
    if incident_model:
        logger.info(
            f"Ignoring PagerDuty event callback. Incident: {incident_id} already exists for connector: {pagerduty_connector.id}")
        return True

    try:
        bot_auth_token = get_db_connector_keys(account_id=account_id, connector_id=pagerduty_connector.id,
                                               key_type=SourceKeyType.PAGER_DUTY_API_KEY)
        if not bot_auth_token:
            logger.error(
                f"Error while processing PagerDuty event for connector: {pagerduty_connector.id}: bot_auth_token not found")
            return False
        bot_auth_token = bot_auth_token.first().key

        pagerduty_incident_metadata, is_created = create_or_update_pagerduty_incident_metadata(account_id=account_id,
                                                                                               account_pagerduty_connector_id=pagerduty_connector.id,
                                                                                               incident_id=incident_id,
                                                                                               event_ts=event_ts,
                                                                                               title=title)

        if pagerduty_incident_metadata:
            if is_created:
                event_datetime = datetime.fromtimestamp(float(event_ts))
                start_timestamp = str((event_datetime - timedelta(days=7)).timestamp())
                try:
                    current_time = current_datetime()
                    saved_task = get_or_create_task(pagerduty_data_fetch_storage_job.__name__, account_id,
                                                    pagerduty_connector.id, pagerduty_incident_metadata.id, incident_id,
                                                    bot_auth_token, event_ts, start_timestamp)
                    if not saved_task:
                        logger.error("Failed to create task for PagerDuty data fetch job")
                    task = pagerduty_data_fetch_storage_job.delay(account_id, pagerduty_connector.id,
                                                                  pagerduty_incident_metadata.id, event, bot_auth_token)
                    task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                      status=PeriodicTaskStatus.SCHEDULED, account_id=account_id,
                                                      scheduled_at=current_time)
                except Exception as e:
                    logger.error(f"Error while creating task for PagerDuty data fetch job with error: {e}")
            return True
        else:
            logger.error(
                f"Error while saving PagerDutyIncidentMetadata for connector: {pagerduty_connector.id}:{incident_id}:{event_ts}")
            return False
    except Exception as e:
        logger.error(f"Error while processing PagerDuty event for connector: {pagerduty_connector.id} with error: {e}")
        return False


