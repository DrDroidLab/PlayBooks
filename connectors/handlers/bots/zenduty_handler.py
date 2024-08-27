import logging
from typing import Dict

from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata
from connectors.crud.connectors_crud import get_db_connectors
from connectors.handlers.tasks import zenduty_handle_webhook_call
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector

logger = logging.getLogger(__name__)


def create_or_update_zd_incident_metadata(account_id, connector_id, incident_id, title=None, service_id=None,
                                          service_name=None):
    try:
        metadata = {
            'incident_id': incident_id,
            'title': title,
            'service_id': service_id,
            'service_name': service_name
        }
        return create_or_update_model_metadata(account_id=account_id, connector_id=connector_id,
                                               connector_type=Source.ZENDUTY,
                                               model_type=SourceModelType.ZENDUTY_INCIDENT,
                                               model_uid=incident_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(
            f"Error while saving ZenDutyIncidentMetadata: {connector_id}:{incident_id} with error: {e}")
        return None, False


def handle_zd_incident(data: Dict):
    payload = data.get('payload')
    active_account_zd_connectors = get_db_connectors(connector_type=Source.ZENDUTY, is_active=True)
    if not active_account_zd_connectors:
        logger.error(f"Error handling zenduty event callback api: active zenduty connector not found")
        raise Exception("No active zenduty connector found")
    zenduty_connector = active_account_zd_connectors.first()
    zenduty_connector_proto: Connector = zenduty_connector.unmasked_proto

    incident_data = payload.get('incident', {})
    incident_id = incident_data.get('incident_number')
    if not incident_id:
        logger.error(f"Error handling zenduty event callback api: incident number not found in request data: {data}")
        raise Exception("Invalid data received")
    service_id = incident_data.get('service', {}).get('unique_id')

    if not service_id:
        logger.error(f"Error handling zenduty event callback api: unique service id not found in request data: {data}")
        raise Exception("Invalid data received")

    title = incident_data.get('title')
    service_name = incident_data.get('service', {}).get('name')
    zenduty_incident = {
        'incident_id': incident_id,
        'title': title,
        'service_id': service_id,
        'service_name': service_name
    }

    incident_status = payload.get('event_type', '')
    if incident_status == 'triggered':
        try:
            saved_task = get_or_create_task(zenduty_handle_webhook_call.__name__, zenduty_connector_proto.id.value,
                                            zenduty_incident)
            if not saved_task:
                logger.error("Failed to create task for zenduty incident fetch job")
            task = zenduty_handle_webhook_call.delay(zenduty_connector_proto.id.value, zenduty_incident)
            task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                              status=PeriodicTaskStatus.SCHEDULED,
                                              account_id=zenduty_connector_proto.account_id.value)
        except Exception as e:
            logger.error(f"Error while creating task for zenduty incident fetch job with error: {e}")
            raise Exception("Error while creating task for zenduty incident fetch job")

    try:
        create_or_update_zd_incident_metadata(account_id=zenduty_connector_proto.account_id.value,
                                              connector_id=zenduty_connector_proto.id.value,
                                              incident_id=incident_id, title=title, service_id=service_id,
                                              service_name=service_name)
        return True
    except Exception as e:
        logger.error(
            f"Error while registering zenduty incident metadata for connector: {zenduty_connector_proto.id.value} with error: {e}")
    return False
