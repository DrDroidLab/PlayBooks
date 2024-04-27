from datetime import datetime
from http.client import IncompleteRead
from typing import List

from celery import shared_task
import pandas as pd
import pytz
import time
import json

from connectors.models import integrations_connector_type_display_name_map
from management.crud.task_crud import get_or_create_task
from management.models import PeriodicTaskStatus, TaskRun
from management.utils.celery_task_signal_utils import publish_task_failure, publish_pre_run_task, publish_post_run_task
from playbooks.utils.utils import current_datetime

from connectors.assets.extractor.metadata_extractor import ConnectorMetadataExtractor
from connectors.assets.extractor.metadata_extractor_facade import connector_metadata_extractor_facade

from connectors.assets.extractor.slack_metadata_extractor import source_identifier, text_identifier_v2, title_identifier
from connectors.models import Connector, ConnectorKey, ConnectorMetadataModelStore, SlackConnectorAlertType, \
    SlackConnectorDataReceived
from executor.workflows.crud.workflow_execution_utils import create_workflow_execution_util
from integrations_api_processors.slack_api_processor import SlackApiProcessor
from management.crud.task_crud import check_scheduled_or_running_task_run_for_task, get_or_create_task
from management.models import PeriodicTaskStatus, TaskRun
from management.utils.celery_task_signal_utils import publish_task_failure, publish_pre_run_task, publish_post_run_task
from playbooks.utils.utils import current_datetime, current_milli_time

from executor.workflows.models import WorkflowEntryPoint, WorkflowEntryPointMapping

from protos.connectors.connector_pb2 import ConnectorType, ConnectorKey as ConnectorKeyProto, \
    ConnectorMetadataModelType as ConnectorMetadataModelTypeProto
from protos.playbooks.workflow_pb2 import WorkflowEntryPoint as WorkflowEntryPointProto
from protos.playbooks.workflow_pb2 import WorkflowSchedule as WorkflowScheduleProto
from utils.proto_utils import dict_to_proto


def clean_raw_extracted_data(message):
    if isinstance(message, dict):
        return json.dumps(message)
    elif isinstance(message, str):
        return message
    else:
        return str(message)


@shared_task(max_retries=3, default_retry_delay=10)
def populate_connector_metadata(account_id, connector_id, connector_type, connector_credentials_dict):
    extractor_class = connector_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
    extractor = extractor_class(**connector_credentials_dict, account_id=account_id, connector_id=connector_id)
    extractor_methods = [method for method in dir(extractor) if
                         callable(getattr(extractor, method)) and method not in dir(ConnectorMetadataExtractor)]
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
    extractor_class = connector_metadata_extractor_facade.get_connector_metadata_extractor_class(connector_type)
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


def match_workflow_to_slack_alert(slack_alert):
    account_id = slack_alert.account_id
    channel_id = slack_alert.channel_id
    alert_type = slack_alert.alert_type
    alert_text = slack_alert.text

    matching_channel_alert_trigger_workflows = WorkflowEntryPoint.objects.filter(account_id=account_id,
                                                                                 type=WorkflowEntryPointProto.ALERT,
                                                                                 is_active=True,
                                                                                 entry_point__alert_config__slack_channel_alert_config__slack_channel_id=channel_id)

    if not matching_channel_alert_trigger_workflows:
        return

    matching_workflow_slack_triggers = []

    for wf in list(matching_channel_alert_trigger_workflows):
        wf_trigger_alert_type = wf.entry_point['alert_config']['slack_channel_alert_config'].get('slack_alert_type')
        wf_trigger_alert_string = wf.entry_point['alert_config']['slack_channel_alert_config'].get(
            'slack_alert_filter_string')

        if wf_trigger_alert_type and wf_trigger_alert_type != alert_type:
            continue

        if wf_trigger_alert_string and wf_trigger_alert_string not in alert_text:
            continue

        matching_workflow_slack_triggers.append(wf)

    for trigger in matching_workflow_slack_triggers:
        workflow_entry_point_mapping = WorkflowEntryPointMapping.objects.filter(account_id=account_id,
                                                                                entry_point_id=trigger.id,
                                                                                is_active=True).first()
        if workflow_entry_point_mapping:
            workflow = workflow_entry_point_mapping.workflow

            current_time_utc = current_datetime()
            workflow_run_id = f'{str(int(current_time_utc.timestamp()))}_{account_id}_{workflow.id}_wf_run'
            schedule: WorkflowScheduleProto = dict_to_proto(workflow.schedule, WorkflowScheduleProto)
            create_workflow_execution_util(workflow.schedule_type, schedule, slack_alert.account, None,
                                           current_time_utc,
                                           workflow.id, workflow_run_id,
                                           {'thread_ts': slack_alert.data.get('event').get('ts')})


@shared_task(max_retries=3, default_retry_delay=10)
def handle_receive_message(slack_connector_id, message):
    try:
        slack_connector = Connector.objects.get(id=slack_connector_id)
        account_id = slack_connector.account_id

        bot_auth_token = None
        bot_auth_token_connector_key = ConnectorKey.objects.filter(connector_id=slack_connector.id,
                                                                   key_type=ConnectorKeyProto.SLACK_BOT_AUTH_TOKEN).first()
        if bot_auth_token_connector_key:
            bot_auth_token = bot_auth_token_connector_key.key

        doctor_droid_app_id = None
        app_id_connector_key = ConnectorKey.objects.filter(connector_id=slack_connector.id,
                                                           key_type=ConnectorKeyProto.SLACK_APP_ID).first()
        if app_id_connector_key:
            doctor_droid_app_id = app_id_connector_key.key

        api_app_id = message['api_app_id']

        if api_app_id != doctor_droid_app_id:
            print(f"Received message from non-doctor droid app: {api_app_id}, ignoring event: {message}")
            return

        event = message['event']

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

        if channel_id:
            slack_connector_key = ConnectorKey.objects.filter(is_active=True, key=channel_id)
            if slack_connector_key:
                slack_connector_key = slack_connector_key.first()
            else:
                slack_connector_key = None
        else:
            slack_connector_key = None

        whitelisted_bots = ['Sentry', 'Datadog', 'New Relic', 'Grafana', 'Metabase', 'Cloudwatch', 'Robusta',
                            'Prometheus_AlertManager', 'MongoDB Atlas', 'Coralogix']

        if event_ts \
                and channel_id \
                and bot_auth_token \
                and account_id \
                and bot_profile in whitelisted_bots:
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
                if slack_connector_key:
                    slack_received_msg.slack_channel_connector_key = slack_connector_key

                if channel_id:
                    slack_received_msg.channel_id = channel_id
                    # get model store
                    slack_channel_metadata = ConnectorMetadataModelStore.objects.filter(account_id=account_id,
                                                                                        connector_type=ConnectorType.SLACK,
                                                                                        model_type=ConnectorMetadataModelTypeProto.SLACK_CHANNEL,
                                                                                        model_uid=channel_id,
                                                                                        is_active=True).first()
                    if slack_channel_metadata:
                        slack_received_msg.slack_channel_metadata_model = slack_channel_metadata

                slack_received_msg.save()

                # Check if a workflow alert trigger matches this alert and create workflow execution entry
                match_workflow_to_slack_alert(slack_received_msg)

            except Exception as e:
                print(f"Error while handling slack_alert_trigger_playbook with error: {e} for message: {message} "
                      f"for account: {account_id}")
    except Exception as e:
        print(f"Error while handling slack handle_receive_message with error: {e} for message: {message}")
    return


handle_receive_message_prerun_notifier = publish_pre_run_task(handle_receive_message)
handle_receive_message_failure_notifier = publish_task_failure(handle_receive_message)
handle_receive_message_postrun_notifier = publish_post_run_task(handle_receive_message)


@shared_task(max_retries=3, default_retry_delay=10)
def slack_connector_data_fetch_storage_job(account_id, connector_id, source_metadata_model_id, workspace_id: str,
                                           channel_id: str, channel_name: str, raw_data_json, is_first_run=False):
    if not source_metadata_model_id and not channel_id:
        print(
            f"Invalid arguments provided for slack_connector_data_fetch_storage_job. Missing source_metadata_model_id:"
            f" or channel_id")
        return
    current_time = time.time()
    print(f"Initiating slack_connector_data_fetch_storage_job for account:{account_id} connector: {connector_id} "
          f"channel_id: {channel_id} at epoch: {current_time}")
    raw_data = pd.read_json(raw_data_json)
    if raw_data is None or not raw_data.shape[0] > 0:
        print(
            f"slack_connector_data_fetch_storage_job: Found no data for channel_id: {channel_id} at epoch: "
            f"{current_time} with connector_id: {connector_id}")
        return

    extracted_data = []
    for index, row in raw_data.iterrows():
        full_message = row['full_message']

        # Check if its a bot alert and should be stored
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


slack_connector_data_fetch_storage_job_prerun_notifier = publish_pre_run_task(slack_connector_data_fetch_storage_job)
slack_connector_data_fetch_storage_job_failure_notifier = publish_task_failure(slack_connector_data_fetch_storage_job)
slack_connector_data_fetch_storage_job_postrun_notifier = publish_post_run_task(slack_connector_data_fetch_storage_job)


@shared_task(max_retries=3, default_retry_delay=10)
def slack_connector_data_fetch_job(account_id, connector_id, source_metadata_model_id, workspace_id: str,
                                   bot_auth_token: str, channel_id: str, channel_name: str, latest_timestamp: str,
                                   oldest_timestamp: str, is_first_run=False):
    if not source_metadata_model_id and not channel_id:
        print(f"Invalid arguments provided for slack_connector_data_fetch_job. Missing source_metadata_model_id"
              f" or channel id")
        return
    if not source_metadata_model_id:
        try:
            source_metadata_model_id = ConnectorMetadataModelStore.objects.filter(account_id=account_id,
                                                                                  connector_id=connector_id,
                                                                                  connector_type=ConnectorType.SLACK,
                                                                                  model_type=ConnectorMetadataModelTypeProto.SLACK_CHANNEL,
                                                                                  model_uid=channel_id,
                                                                                  is_active=True).first().id
        except Exception as e:
            print(f"Exception occurred in slack_connector_data_fetch_job: error while fetching "
                  f"source_metadata_model_id for account: {account_id}, connector: {connector_id} with error: {e}")
            return
    current_time = time.time()
    if not bot_auth_token or not channel_id:
        print(f"Invalid arguments provided for slack_connector_data_fetch_job")
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
    scheduled_first_run = False
    try:
        while visit_next_cursor:
            raw_data = pd.DataFrame(columns=["uuid", "full_message"])
            try:
                response_paginated = slack_api_processor.fetch_conversation_history(workspace_id, channel_id,
                                                                                    latest_timestamp,
                                                                                    oldest_timestamp, next_cursor)

                if response_paginated.status_code == 429:
                    print(f"Rate limit exceeded for workspace_id: {workspace_id} with error: {response_paginated}")
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
                if is_first_run:
                    scheduled_first_run = True
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
                saved_task = get_or_create_task(slack_connector_data_fetch_storage_job.__name__, account_id,
                                                connector_id, source_metadata_model_id, workspace_id, channel_id,
                                                channel_name, raw_data_json, scheduled_first_run)

                if not saved_task:
                    print(f"Failed to create slack_connector_data_process_job task for account: {account_id}, "
                          f"connector: {connector_id}")
                    continue
                if check_scheduled_or_running_task_run_for_task(saved_task):
                    continue

                task = slack_connector_data_fetch_storage_job.delay(account_id, connector_id, source_metadata_model_id,
                                                                    workspace_id, channel_id, channel_name,
                                                                    raw_data_json, scheduled_first_run)
                try:
                    task_run = TaskRun.objects.create(task=saved_task, task_uuid=task.id,
                                                      status=PeriodicTaskStatus.SCHEDULED,
                                                      account_id=account_id,
                                                      scheduled_at=datetime.fromtimestamp(float(current_time)))
                except Exception as e:
                    print(f"Exception occurred while saving slack_connector_data_process_job task run for account: "
                          f"{account_id}, connector: {connector_id} with error: {e}")
                    continue
            if not visit_next_cursor:
                break
    except Exception as e:
        print(f"Exception occurred while fetching conversation history for channel_id: {channel_id} with error: {e}")
        return None


slack_data_fetch_job_task_prerun_notifier = publish_pre_run_task(slack_connector_data_fetch_job)
slack_data_fetch_job_task_failure_notifier = publish_task_failure(slack_connector_data_fetch_job)
slack_data_fetch_job_task_postrun_notifier = publish_post_run_task(slack_connector_data_fetch_job)
