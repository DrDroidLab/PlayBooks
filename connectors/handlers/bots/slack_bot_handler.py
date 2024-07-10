import logging
from typing import Dict
from datetime import datetime, timedelta

from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models, create_or_update_model_metadata
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from connectors.handlers.tasks import slack_bot_data_fetch_job, slack_bot_handle_receive_message
from executor.source_processors.slack_api_processor import SlackApiProcessor
from management.crud.task_crud import get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from utils.time_utils import current_datetime
from protos.base_pb2 import Source, SourceModelType, SourceKeyType

logger = logging.getLogger(__name__)


def create_or_update_slack_channel_metadata(account_id, account_slack_connector_id, channel_id, event_ts,
                                            channel_name=None, inviter_id=None):
    try:
        metadata = {'channel_name': channel_name, 'event_ts': event_ts}
        if inviter_id:
            metadata['inviter_id'] = inviter_id
        return create_or_update_model_metadata(account_id=account_id, connector_id=account_slack_connector_id,
                                               connector_type=Source.SLACK,
                                               model_type=SourceModelType.SLACK_CHANNEL,
                                               model_uid=channel_id, is_active=True, metadata=metadata)
    except Exception as e:
        logger.error(
            f"Error while saving SlackChannelMetadata: {account_slack_connector_id}:{channel_id} with error: {e}")
        return None, False


def handle_slack_event_callback(data: Dict):
    if 'team_id' not in data or 'event' not in data:
        logger.error(f"Error handling slack event callback api, team_id or event not found in request data: {data}")
        raise Exception("Invalid data received")
    team_id = data['team_id']
    event = data['event']
    api_app_id = data.get('api_app_id', None)
    active_account_slack_connectors = get_db_connectors(connector_type=Source.SLACK, is_active=True)
    if not active_account_slack_connectors:
        logger.error(f"Error handling slack event callback api for {team_id}: active slack connector not found")
        raise Exception("No active slack connector found")

    slack_connector = active_account_slack_connectors.first()
    for sc in active_account_slack_connectors:
        slack_connector_proto = sc.unmasked_proto
        c_keys = slack_connector_proto.keys
        for c_key in c_keys:
            if c_key.key_type == SourceKeyType.SLACK_APP_ID and c_key.key.value == api_app_id:
                slack_connector = sc
                break

    event_type = event.get('type', '')
    if not event_type:
        logger.error(
            f"Error handling slack event callback api for {team_id}: event type not found in request data: {data}")
        raise Exception("Invalid data received")

    if event_type not in ['message', 'channel_join', 'member_joined_channel', 'channel_left', 'member_left_channel']:
        logger.info(
            f"Ignoring slack event callback. Received invalid event type: {event['type']} for connector {team_id}")
        return True

    event_subtype = event.get('subtype', '')
    event_type = event.get('type', '')
    event_ts = event.get('event_ts', '')
    channel_id = event.get('channel', '')

    if event_type == 'message':
        try:
            slack_bot_handle_receive_message.delay(slack_connector.id, data)
        except Exception as e:
            logger.error(f"Error while handling slack 'message' event with error: {e} for connector: {team_id}")
            raise Exception("Error while handling slack 'message' event")

    if event_type == 'channel_left' or event_type == 'member_left_channel':
        slack_channel_model = get_db_connector_metadata_models(account_id=slack_connector.account_id,
                                                               connector_id=slack_connector.id,
                                                               connector_type=Source.SLACK,
                                                               model_type=SourceModelType.SLACK_CHANNEL,
                                                               model_uid=channel_id, is_active=True)
        if slack_channel_model:
            slack_channel_model.update(is_active=False)
            logger.info(
                f"Deactivated slack channel: {channel_id} for connector: {team_id}")
            return True

    if event_subtype == 'channel_join' or event_type == 'member_joined_channel':
        slack_channel_model = get_db_connector_metadata_models(account_id=slack_connector.account_id,
                                                               connector_id=slack_connector.id,
                                                               connector_type=Source.SLACK,
                                                               model_type=SourceModelType.SLACK_CHANNEL,
                                                               model_uid=channel_id, is_active=True)
        if slack_channel_model:
            logger.info(
                f"Ignoring slack event callback. Slack channel: {channel_id} already exists for connector: {team_id}")
            return True

        try:
            bot_auth_token = get_db_connector_keys(account_id=slack_connector.account_id,
                                                   connector_id=slack_connector.id,
                                                   key_type=SourceKeyType.SLACK_BOT_AUTH_TOKEN)
            if not bot_auth_token:
                logger.error(
                    f"Error while registering slack channel for connector: {team_id}: bot_auth_token not found")
                return False
            bot_auth_token = bot_auth_token.first().key
            slack_api_processor = SlackApiProcessor(bot_auth_token)
            channel_name = None
            channel_info = slack_api_processor.fetch_channel_info(channel_id)
            if channel_info:
                if 'name' in channel_info:
                    channel_name = channel_info['name']
            inviter_id = event.get('inviter', None)
            slack_channel_metadata, is_created = create_or_update_slack_channel_metadata(slack_connector.account_id,
                                                                                         slack_connector.id, channel_id,
                                                                                         event_ts, channel_name,
                                                                                         inviter_id)
            if slack_channel_metadata:
                if is_created:
                    event_datetime = datetime.fromtimestamp(float(event_ts))
                    start_timestamp = str((event_datetime - timedelta(days=7)).timestamp())
                    try:
                        current_time = current_datetime()
                        saved_task = get_or_create_task(slack_bot_data_fetch_job.__name__, slack_connector.account_id,
                                                        slack_connector.id, slack_channel_metadata.id, team_id,
                                                        bot_auth_token, channel_id, str(event_ts), start_timestamp)
                        if not saved_task:
                            logger.error("Failed to create task for slack bot data fetch job")
                        task = slack_bot_data_fetch_job.delay(slack_connector.account_id,
                                                              slack_connector.id, slack_channel_metadata.id, team_id,
                                                              bot_auth_token, channel_id, str(event_ts),
                                                              start_timestamp)
                        task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                          status=PeriodicTaskStatus.SCHEDULED,
                                                          account_id=slack_connector.account_id,
                                                          scheduled_at=current_time)
                    except Exception as e:
                        logger.error(f"Error while creating task for slack bot data fetch job with error: {e}")
                return True
            else:
                logger.error(f"Error while saving SlackBotConfig for connector: {team_id}:{channel_id}:{event_ts}")
                return False
        except Exception as e:
            logger.error(
                f"Error while registering slack bot config for connector: {team_id} with error: {e}")
            return False
