import time
from datetime import datetime
from http.client import IncompleteRead
from typing import List
import logging

import pandas as pd
import pytz
from celery import shared_task

from connectors.assets.extractor.slack_metadata_extractor import title_identifier, text_identifier_v2, source_identifier
from connectors.crud.connector_asset_model_crud import get_db_connector_metadata_models
from connectors.crud.connectors_crud import get_db_connectors, get_db_connector_keys
from connectors.models import SlackConnectorAlertType, SlackConnectorDataReceived
from executor.workflows.crud.workflow_entry_point_crud import get_db_workflow_entry_points
from executor.workflows.crud.workflow_execution_utils import trigger_slack_alert_entry_point_workflows, \
    trigger_pagerduty_alert_entry_point_workflows
from executor.workflows.entry_point.entry_point_evaluator_facade import entry_point_evaluator_facade
from executor.source_processors.slack_api_processor import SlackApiProcessor
from management.crud.task_crud import check_scheduled_or_running_task_run_for_task, get_or_create_task
from management.models import TaskRun, PeriodicTaskStatus
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.connectors.connector_pb2 import Connector
from utils.time_utils import get_current_time
from protos.base_pb2 import Source, SourceModelType, SourceKeyType
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint

logger = logging.getLogger(__name__)


@shared_task(max_retries=3, default_retry_delay=10)
def slack_bot_data_fetch_storage_job(account_id, connector_id, source_metadata_model_id, channel_id: str,
                                     raw_data_json):
    current_time = get_current_time()
    if not source_metadata_model_id or not channel_id or not raw_data_json:
        print(f"Invalid arguments provided for slack_bot_data_fetch_storage_job. Missing: "
              f"source_metadata_model_id or channel_id or raw_data_json")
        return
    print(f"Initiating slack_bot_data_fetch_storage_job for account:{account_id} connector: {connector_id} "
          f"channel_id: {channel_id} at epoch: {current_time}")
    raw_data = pd.read_json(raw_data_json)
    if raw_data is None or not raw_data.shape[0] > 0:
        print(f"slack_bot_data_fetch_storage_job: Found no data for channel_id: {channel_id} at epoch: "
              f"{current_time} with connector_id: {connector_id}")
        return

    extracted_data = []
    for index, row in raw_data.iterrows():
        full_message = row['full_message']
        is_bot_message = True
        if not full_message.get('bot_profile'):
            if not full_message.get('subtype') or full_message.get('subtype') != 'bot_message':
                is_bot_message = False
        if is_bot_message:
            alert_title = title_identifier(full_message, 'slack')
            alert_text = text_identifier_v2(full_message, 'slack')
            alert_type = source_identifier(full_message, 'slack')

            db_alert_type, is_created = SlackConnectorAlertType.objects.get_or_create(
                account_id=account_id,
                connector_id=connector_id,
                channel_id=channel_id,
                alert_type=alert_type)

            event_ts = full_message.get('ts', None)
            data_timestamp = datetime.utcfromtimestamp(float(event_ts))
            data_timestamp = data_timestamp.replace(tzinfo=pytz.utc)

            extracted_data.append(
                SlackConnectorDataReceived(account_id=account_id, connector_id=connector_id,
                                           slack_channel_metadata_model_id=source_metadata_model_id,
                                           channel_id=channel_id,
                                           data=full_message, text=alert_text, alert_type=alert_type, title=alert_title,
                                           data_timestamp=data_timestamp, db_alert_type=db_alert_type))
    try:
        saved_data: List[SlackConnectorDataReceived] = SlackConnectorDataReceived.objects.bulk_create(extracted_data,
                                                                                                      batch_size=1000)
    except Exception as e:
        print(f"Exception occurred slack_connector_data_fetch_job: Error while bulk creating extracted data for "
              f"account: {account_id}, connector: {connector_id} with error: {e}")
        raise e


slack_bot_data_fetch_storage_job_prerun_notifier = publish_pre_run_task(slack_bot_data_fetch_storage_job)
slack_bot_data_fetch_storage_job_failure_notifier = publish_task_failure(slack_bot_data_fetch_storage_job)
slack_bot_data_fetch_storage_job_postrun_notifier = publish_post_run_task(slack_bot_data_fetch_storage_job)


@shared_task(max_retries=3, default_retry_delay=10)
def slack_bot_data_fetch_job(account_id, connector_id, source_metadata_model_id, team_id: str, bot_auth_token: str,
                             channel_id: str, latest_timestamp: str, oldest_timestamp: str):
    current_time = get_current_time()
    if not bot_auth_token or not source_metadata_model_id or not channel_id:
        print(f"Invalid arguments provided for slack_bot_data_fetch_job. Missing bot_auth_token or "
              f"source_metadata_model_id or channel_id")
        return

    if not latest_timestamp:
        print(f"Invalid arguments provided for slack_connector_data_fetch_job: Missing latest_timestamp. "
              f"Setting it to current time: {current_time}")
        latest_timestamp = current_time

    if not oldest_timestamp:
        oldest_timestamp = ''

    print(f"Initiating slack_connector_data_fetch_job for account:{account_id} connector: {connector_id} "
          f"channel_id: {channel_id} at epoch: {current_time} with latest_timestamp: {latest_timestamp}, "
          f"oldest_timestamp: {oldest_timestamp}")
    slack_api_processor = SlackApiProcessor(bot_auth_token)
    message_counter = 0
    visit_next_cursor = True
    failure_count = 0
    next_cursor = None
    try:
        while visit_next_cursor:
            raw_data = pd.DataFrame(columns=["uuid", "full_message"])
            try:
                response_paginated = slack_api_processor.fetch_conversation_history(team_id, channel_id,
                                                                                    latest_timestamp,
                                                                                    oldest_timestamp, next_cursor)

                if response_paginated.status_code == 429:
                    print(f"Rate limit exceeded for workspace_id: {team_id} with error: {response_paginated}")
                    if response_paginated.headers.get('Retry-After', None):
                        try:
                            wait_time = int(response_paginated.headers.get('Retry-After'))
                        except Exception as e:
                            wait_time = 100
                    else:
                        wait_time = 100
                    time.sleep(wait_time)
                    continue
            except IncompleteRead as e:
                print(f"IncompleteRead occurred while fetching conversation history for channel_id: {channel_id} "
                      f"with error: {e}")
                continue
            except Exception as e:
                failure_count = failure_count + 1
                print(f"Exception occurred while fetching conversation history for channel_id: {channel_id} "
                      f"with error: {e}")
                # Add a delay of 100 seconds before retrying
                time.sleep(100)
                if failure_count > 20:
                    print(f"Failed to fetch conversation history for channel_id: {channel_id} after 10 retries")
                    visit_next_cursor = False
                    return None
                continue
            if not response_paginated:
                break
            if 'response_metadata' in response_paginated and 'next_cursor' in response_paginated['response_metadata']:
                next_cursor = response_paginated['response_metadata']['next_cursor']
            else:
                visit_next_cursor = False
            if 'messages' in response_paginated:
                messages = response_paginated["messages"]
                if not messages or len(messages) <= 0:
                    break
                new_timestamp = response_paginated["messages"][0]['ts']
                if float(new_timestamp) >= float(latest_timestamp):
                    break
                if oldest_timestamp and float(new_timestamp) <= float(oldest_timestamp):
                    break
                for message in response_paginated["messages"]:
                    temp = pd.DataFrame([{"full_message": message, "uuid": message.get('ts')}])
                    raw_data = pd.concat([temp, raw_data])
                    message_counter = message_counter + 1
                print(f'{str(message_counter)}, messages published')
                print(f'Extracted Data till {datetime.fromtimestamp(float(new_timestamp))}')
                if raw_data is None or not raw_data.shape[0] > 0:
                    print(f"slack_connector_data_fetch_job: Found no data for channel_id: {channel_id} at "
                          f"epoch: {current_time} with connector_id: {connector_id}")
                    break
                raw_data_json = raw_data.to_json(orient='records')
                saved_task = get_or_create_task(slack_bot_data_fetch_storage_job.__name__, account_id,
                                                connector_id, source_metadata_model_id, channel_id, raw_data_json)

                if not saved_task:
                    print(f"Failed to create slack_bot_data_fetch_storage_job task for account: {account_id}, "
                          f"connector: {connector_id}")
                    continue
                if check_scheduled_or_running_task_run_for_task(saved_task):
                    continue

                task = slack_bot_data_fetch_storage_job.delay(account_id, connector_id, source_metadata_model_id,
                                                              channel_id, raw_data_json)
                try:
                    task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                      status=PeriodicTaskStatus.SCHEDULED,
                                                      account_id=account_id,
                                                      scheduled_at=datetime.fromtimestamp(float(current_time)))
                except Exception as e:
                    print(f"Exception occurred while saving slack_bot_data_fetch_storage_job task run for account: "
                          f"{account_id}, connector: {connector_id} with error: {e}")
                    continue
            if not visit_next_cursor:
                break
    except Exception as e:
        print(f"Exception occurred while fetching conversation history for channel_id: {channel_id} with error: {e}")
        return None


slack_bot_data_fetch_job_task_prerun_notifier = publish_pre_run_task(slack_bot_data_fetch_job)
slack_bot_data_fetch_job_task_failure_notifier = publish_task_failure(slack_bot_data_fetch_job)
slack_bot_data_fetch_job_task_postrun_notifier = publish_post_run_task(slack_bot_data_fetch_job)


@shared_task(max_retries=3, default_retry_delay=10)
def slack_bot_handle_receive_message(slack_connector_id, message):
    try:
        slack_connector = get_db_connectors(connector_id=slack_connector_id)
        if not slack_connector:
            print(f"Error while handling slack handle_receive_message: Connector not found for connector_id: "
                  f"{slack_connector_id}")
            return
        slack_connector = slack_connector.first()
        account_id = slack_connector.account_id
        bot_auth_token = get_db_connector_keys(account_id=account_id, connector_id=slack_connector.id,
                                               key_type=SourceKeyType.SLACK_BOT_AUTH_TOKEN)
        if not bot_auth_token:
            print(f"Error while handling slack handle_receive_message: Bot auth token not found for connector_id: "
                  f"{slack_connector_id}")
            return
        bot_auth_token = bot_auth_token.first().key
        doctor_droid_app_id = None
        app_id = get_db_connector_keys(account_id=account_id, connector_id=slack_connector.id,
                                       key_type=SourceKeyType.SLACK_APP_ID)
        if app_id:
            doctor_droid_app_id = app_id.first().key

        api_app_id = message['api_app_id']

        if api_app_id != doctor_droid_app_id:
            print(f"Received message not from doctor droid app: {api_app_id}, ignoring event: {message}")
            return

        event = message.get('event', '')

        if not event.get('bot_profile'):
            if not event.get('subtype') or event.get('subtype') != 'bot_message':
                print(f"Received message from a non-bot user, ignoring event: {message}")
                return

        if 'bot_profile' in event and 'app_id' in event['bot_profile'] and \
                event['bot_profile']['app_id'] == doctor_droid_app_id:
            print(f"Received message from doctor droid app, ignoring event: {event['bot_profile']['app_id']}")
            return

        bot_profile = event.get('bot_profile', {}).get("name")
        if not bot_profile:
            bot_profile = event.get('subtype')

        event_ts = event.get('ts', None)
        channel_id = event.get('channel', None)
        if not event_ts:
            event_time = event.get('event_time', None)
            if event_time:
                data_timestamp = datetime.utcfromtimestamp(float(event_time))
                data_timestamp = data_timestamp.replace(tzinfo=pytz.utc)
            else:
                data_timestamp = datetime.utcnow()
        else:
            data_timestamp = datetime.utcfromtimestamp(float(event_ts))
            data_timestamp = data_timestamp.replace(tzinfo=pytz.utc)

        if event_ts and channel_id and bot_auth_token and account_id:
            try:
                alert_title = title_identifier(message['event'], 'slack')
                alert_text = text_identifier_v2(message['event'], 'slack')
                alert_type = source_identifier(message['event'], 'slack')

                db_alert_type, is_created = SlackConnectorAlertType.objects.get_or_create(
                    account_id=slack_connector.account_id,
                    connector=slack_connector,
                    channel_id=channel_id,
                    alert_type=alert_type)

                slack_received_msg = SlackConnectorDataReceived(
                    account_id=slack_connector.account_id,
                    connector=slack_connector,
                    data=message,
                    data_timestamp=data_timestamp,
                    text=alert_text,
                    title=alert_title,
                    alert_type=alert_type,
                    db_alert_type=db_alert_type
                )

                if channel_id:
                    slack_received_msg.channel_id = channel_id
                    slack_channel_metadata = get_db_connector_metadata_models(account_id=account_id,
                                                                              connector_type=Source.SLACK,
                                                                              model_type=SourceModelType.SLACK_CHANNEL,
                                                                              model_uid=channel_id,
                                                                              is_active=True)
                    if slack_channel_metadata:
                        slack_received_msg.slack_channel_metadata_model = slack_channel_metadata.first()

                slack_received_msg.save()
                all_slack_chanel_alert_ep = get_db_workflow_entry_points(account_id=account_id,
                                                                         entry_point_type=WorkflowEntryPoint.Type.SLACK_CHANNEL_ALERT,
                                                                         is_active=True)
                ep_protos: [WorkflowEntryPoint] = [e.proto for e in all_slack_chanel_alert_ep]

                slack_alert_event = {'channel_id': channel_id, 'alert_type': alert_type, 'alert_text': alert_text}
                for ep in ep_protos:
                    is_triggered = entry_point_evaluator_facade.evaluate(ep, slack_alert_event)
                    if is_triggered:
                        trigger_slack_alert_entry_point_workflows(account_id, ep.id.value, event_ts)
            except Exception as e:
                print(f"Error while handling slack_alert_trigger_playbook with error: {e} for message: {message} "
                      f"for account: {account_id}")
    except Exception as e:
        print(f"Error while handling slack handle_receive_message with error: {e} for message: {message}")
    return


slack_bot_handle_receive_message_prerun_notifier = publish_pre_run_task(slack_bot_handle_receive_message)
slack_bot_handle_receive_message_failure_notifier = publish_task_failure(slack_bot_handle_receive_message)
slack_bot_handle_receive_message_postrun_notifier = publish_post_run_task(slack_bot_handle_receive_message)


@shared_task(max_retries=3, default_retry_delay=10)
def pagerduty_handle_webhook_call(pagerduty_connector_id, pager_duty_incident):
    try:
        pagerduty_connector = get_db_connectors(connector_id=pagerduty_connector_id)
        pagerduty_connector = pagerduty_connector.first()
        if not pagerduty_connector:
            logger.error(
                f"Error while handling PagerDuty handle_receive_message: Connector not found for connector_id: "
                f"{pagerduty_connector_id}")
            return
        pagerduty_connector_proto: Connector = pagerduty_connector.unmasked_proto
        account_id = pagerduty_connector_proto.account_id.value
        if 'incident_id' not in pager_duty_incident or 'service_id' not in pager_duty_incident:
            logger.error(
                f"Error while handling pagerduty webhook call: Incident id or service id not found for pagerduty event")
            return

        all_pd_incident_entry_points = get_db_workflow_entry_points(account_id=account_id,
                                                                    entry_point_type=WorkflowEntryPoint.Type.PAGERDUTY_INCIDENT,
                                                                    is_active=True)
        ep_protos = [e.proto for e in all_pd_incident_entry_points]
        incident_id = pager_duty_incident['incident_id']
        for ep in ep_protos:
            is_triggered = entry_point_evaluator_facade.evaluate(ep, pager_duty_incident)
            if is_triggered:
                trigger_pagerduty_alert_entry_point_workflows(account_id, ep.id.value, incident_id)
    except Exception as e:
        logger.error(f"Error while handling pagerduty webhook call with error: {e} for event: {pager_duty_incident}")
    return


pagerduty_handle_webhook_call_prerun_notifier = publish_pre_run_task(pagerduty_handle_webhook_call)
pagerduty_handle_webhook_call_failure_notifier = publish_task_failure(pagerduty_handle_webhook_call)
pagerduty_handle_webhook_call_postrun_notifier = publish_post_run_task(pagerduty_handle_webhook_call)
