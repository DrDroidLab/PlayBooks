import logging
from typing import Dict

from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata
from connectors.crud.connectors_crud import get_db_connectors
from connectors.handlers.tasks import pagerduty_handle_webhook_call
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector

logger = logging.getLogger(__name__)


def create_or_update_pagerduty_incident_metadata(account_id, connector_id, incident_id, title=None, service_id=None,
                                                 service_name=None):
    try:
        metadata = {
            'incident_id': incident_id,
            'title': title,
            'service_id': service_id,
            'service_name': service_name
        }
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
    pagerduty_connector_proto: Connector = pagerduty_connector.unmasked_proto

    event_data = event.get('event', {}).get('data', {})
    incident_id = event_data.get('id')
    if not incident_id:
        logger.error(f"Error handling pagerduty event callback api: incident id not found in request data: {data}")
        raise Exception("Invalid data received")
    service_id = event_data.get('service', {}).get('id')

    if not service_id:
        logger.error(f"Error handling pagerduty event callback api: service id not found in request data: {data}")
        raise Exception("Invalid data received")

    title = event_data.get('title')
    service_name = event_data.get('service', {}).get('summary')
    pager_duty_incident = {
        'incident_id': incident_id,
        'title': title,
        'service_id': service_id,
        'service_name': service_name
    }

    incident_status = event.get('data').get('status', '')
    if incident_status == 'triggered':
        try:
            saved_task = get_or_create_task(pagerduty_handle_webhook_call.__name__, pagerduty_connector_proto.id.value,
                                            pager_duty_incident)
            if not saved_task:
                logger.error("Failed to create task for pagerduty incident fetch job")
            task = pagerduty_handle_webhook_call.delay(pagerduty_connector_proto.id.value, pager_duty_incident)
            task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                              status=PeriodicTaskStatus.SCHEDULED,
                                              account_id=pagerduty_connector_proto.account_id.value)
        except Exception as e:
            logger.error(f"Error while creating task for pagerduty incident fetch job with error: {e}")
            raise Exception("Error while creating task for pagerduty incident fetch job")

    try:
        create_or_update_pagerduty_incident_metadata(account_id=pagerduty_connector_proto.account_id.value,
                                                     connector_id=pagerduty_connector_proto.id.value,
                                                     incident_id=incident_id, title=title, service_id=service_id,
                                                     service_name=service_name)
        return True
    except Exception as e:
        logger.error(
            f"Error while registering pagerduty incident metadata for connector: {pagerduty_connector_proto.id.value} with error: {e}")
    return False
