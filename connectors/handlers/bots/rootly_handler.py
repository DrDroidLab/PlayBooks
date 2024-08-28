import logging
from typing import Dict

from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata
from connectors.crud.connectors_crud import get_db_connectors
from connectors.handlers.tasks import rootly_handle_webhook_call
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from protos.base_pb2 import Source, SourceModelType
from protos.connectors.connector_pb2 import Connector

logger = logging.getLogger(__name__)


def create_or_update_rootly_incident_metadata(account_id, connector_id, incident_id, title=None):
    try:
        metadata = {
            'incident_id': incident_id,
            'title': title,
        }
        return create_or_update_model_metadata(account_id=account_id, connector_id=connector_id,
                                               connector_type=Source.ROOTLY,
                                               model_type=SourceModelType.ROOTLY_INCIDENT,
                                               model_uid=incident_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(
            f"Error while saving RootlyIncidentMetadata: {connector_id}:{incident_id} with error: {e}")
        return None, False


def handle_rootly_incident(data: Dict):
    active_account_rootly_connectors = get_db_connectors(connector_type=Source.ROOTLY, is_active=True)
    if not active_account_rootly_connectors:
        logger.error(f"Error handling rootly event callback api: active rootly connector not found")
        raise Exception("No active rootly connector found")
    rootly_connector = active_account_rootly_connectors.first()
    rootly_connector_proto: Connector = rootly_connector.unmasked_proto

    event = data.get('event')
    event_data = data.get('data', {})
    incident_id = event_data.get('id')
    if not incident_id:
        logger.error(f"Error handling rootly event callback api: incident id not found in request data: {data}")
        raise Exception("Invalid data received")

    title = event_data.get('title')
    rootly_incident = {
        'incident_id': incident_id,
        'title': title,
    }

    event_type = event.get('type', '')
    if event_type == 'incident.created':
        try:
            saved_task = get_or_create_task(rootly_handle_webhook_call.__name__, rootly_connector_proto.id.value,
                                            rootly_incident)
            if not saved_task:
                logger.error("Failed to create task for rootly incident fetch job")
            task = rootly_handle_webhook_call.delay(rootly_connector_proto.id.value, rootly_incident)
            task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                              status=PeriodicTaskStatus.SCHEDULED,
                                              account_id=rootly_connector_proto.account_id.value)
        except Exception as e:
            logger.error(f"Error while creating task for rootly incident fetch job with error: {e}")
            raise Exception("Error while creating task for rootly incident fetch job")

    try:
        create_or_update_rootly_incident_metadata(account_id=rootly_connector_proto.account_id.value,
                                              connector_id=rootly_connector_proto.id.value,
                                              incident_id=incident_id, title=title)
        return True
    except Exception as e:
        logger.error(
            f"Error while registering rootly incident metadata for connector: {rootly_connector_proto.id.value} with error: {e}")
    return False
