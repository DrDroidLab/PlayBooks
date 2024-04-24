from typing import Dict
from datetime import datetime, timedelta, timezone

from connectors.models import Connector, ConnectorKey, ConnectorMetadataModelStore, ConnectorPeriodicRunMetadata
from connectors.tasks import handle_receive_message, slack_connector_data_fetch_job
from integrations_api_processors.slack_api_processor import SlackApiProcessor
from protos.connectors.connector_pb2 import ConnectorType, ConnectorKey as ConnectorKeyProto, ConnectorMetadataModelType as ConnectorMetadataModelTypeProto


def create_slack_connector_channel_scrap_schedule(account_id, slack_connector_id, channel_id, task_run_id,
                                                  data_extraction_to, data_extraction_from):
    try:
        metadata = {'data_extraction_from': str(data_extraction_from), 'data_extraction_to': str(data_extraction_to),
                    'channel_id': channel_id}
        new_slack_connector_data_scrap_schedule = ConnectorPeriodicRunMetadata.objects.create(account_id=account_id,
                                                                                              connector_id=slack_connector_id,
                                                                                              metadata=metadata,
                                                                                              task_run_id=task_run_id,
                                                                                              status=1,
                                                                                              started_at=datetime.now(
                                                                                                  timezone.utc))
        return new_slack_connector_data_scrap_schedule
    except Exception as e:
        print(
            f"Error while saving SlackConnectorDataScrapSchedule: "
            f":{slack_connector_id}:{data_extraction_from}:{data_extraction_to} with error: {e}")
    return None


def create_or_update_slack_channel_metadata(account_id, account_slack_connector_id, channel_id, event_ts,
                                                 channel_name=None, inviter_id=None, is_active=True):
    try:
        metadata = {'channel_name': channel_name, 'event_ts': event_ts}
        if inviter_id:
            metadata['inviter_id'] = inviter_id
        new_slack_channel_metadata, is_created = ConnectorMetadataModelStore.objects.update_or_create(account_id=account_id,
                                                                                            connector_id=account_slack_connector_id,
                                                                                            connector_type=ConnectorType.SLACK,
                                                                                            model_type=ConnectorMetadataModelTypeProto.SLACK_CHANNEL,
                                                                                            model_uid=channel_id, defaults={
                'metadata': metadata, 'is_active': is_active})
        return new_slack_channel_metadata, is_created
    except Exception as e:
        print(
            f"Error while saving SlackChannelMetadata: {account_slack_connector_id}:{channel_id} with error: {e}")
        return None


def handle_event_callback(data: Dict):
    if 'team_id' not in data or 'event' not in data:
        print(f"Error handling slack event callback api, team_id or event not found in request data: {data}")
        return False
    team_id = data['team_id']
    event = data['event']
    active_account_slack_connectors = Connector.objects.filter(connector_type=ConnectorType.SLACK, is_active=True)
    if not active_account_slack_connectors:
        print(f"Error handling slack event callback api for {team_id}: active slack connector not found")
        return False
    if event and 'type' in event:
        event_type = event['type']
        event_subtype = event.get('subtype')
        event_ts = event.get('event_ts', None)
        channel_id = event.get('channel', None)
        slack_connector = active_account_slack_connectors.first()
        if event_type == 'message':
            if not event_subtype:
                try:
                    handle_receive_message.delay(slack_connector.id, data)
                except Exception as e:
                    print(f"Error while handling slack 'message' event with error: {e} for connector: {team_id}")
                return True
            if event_subtype == 'channel_join':
                try:
                    bot_auth_token = slack_connector.metadata.get('bot_auth_token', None)
                    if not bot_auth_token:
                        print(
                            f"Error while registering slack channel for connector: {team_id}: bot_auth_token not found")
                        return False
                    slack_api_processor = SlackApiProcessor(bot_auth_token)
                    channel_name = None
                    channel_info = slack_api_processor.fetch_channel_info(channel_id)
                    if channel_info:
                        if 'name' in channel_info:
                            channel_name = channel_info['name']
                    inviter_id = event.get('inviter', None)
                    slack_channel_metadata, is_created = create_or_update_slack_channel_metadata(
                        slack_connector.account_id,
                        slack_connector.id,
                        channel_id,
                        event_ts,
                        channel_name,
                        inviter_id)
                    if slack_channel_metadata:
                        if channel_name:
                            channel_header = channel_name
                        if not channel_name:
                            task_channel_name = channel_id
                        else:
                            task_channel_name = channel_name
                        if is_created:
                            start_timestamp = str((datetime.fromtimestamp(float(event_ts)) - timedelta(days=7)).timestamp())
                            task = slack_connector_data_fetch_job.delay(account_id=slack_connector.account_id,
                                                                        connector_id=slack_connector.id,
                                                                        source_connector_key_id=None,
                                                                        workspace_id=team_id,
                                                                        bot_auth_token=bot_auth_token,
                                                                        channel_id=channel_id,
                                                                        channel_name=task_channel_name,
                                                                        latest_timestamp=str(event_ts),
                                                                        oldest_timestamp=start_timestamp,
                                                                        is_first_run=True)
                            task_id = task.id
                            data_extraction_to = datetime.fromtimestamp(float(event_ts))
                            create_slack_connector_channel_scrap_schedule(slack_connector.account_id,
                                                                        slack_connector.id,
                                                                        channel_id,
                                                                        task_id,
                                                                        data_extraction_to,
                                                                        '')
                        return True
                    else:
                        print(f"Error while saving SlackBotConfig for connector: {team_id}:{channel_id}:{event_ts}")
                        return False
                except Exception as e:
                    print(f"Error while registering slack bot config for connector: {team_id} with error: {e}")
                    return False
            else:
                print(f"Received invalid event type: {event['type']} for connector {team_id}")
                return False
    else:
        print(f"Error handling event in connector {team_id}: No event found in request data: {data}")
        return False
    