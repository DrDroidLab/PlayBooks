import logging
import traceback
from typing import Dict
from datetime import datetime, timedelta


from connectors.crud.connector_asset_model_crud import create_or_update_model_metadata, get_db_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from connectors.handlers.tasks import pagerduty_data_fetch_storage_job
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from utils.time_utils import current_datetime
from protos.base_pb2 import Source, SourceModelType, SourceKeyType


logger = logging.getLogger(__name__)


def create_or_update_pagerduty_incident_metadata(account_id, account_pagerduty_connector_id, incident_id, title=None):
    try:
        metadata = {'title': title}
        return create_or_update_model_metadata(account_id=account_id, connector_id=account_pagerduty_connector_id,
                                               connector_type=Source.PAGER_DUTY,
                                               model_type=SourceModelType.PAGERDUTY_INCIDENT,
                                               model_uid=incident_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(f"Error while saving PagerDutyIncidentMetadata: {account_pagerduty_connector_id}:{incident_id} with error: {e}")
        return None, False


def handle_pagerduty_event_callback(data: Dict):
    return


