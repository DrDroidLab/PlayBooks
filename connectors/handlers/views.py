from typing import Union
import logging

from django.http import HttpRequest, JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from google.protobuf.wrappers_pb2 import BoolValue, StringValue
from rest_framework.decorators import api_view, authentication_classes
from django.conf import settings

from accounts.authentication import AccountApiTokenAuthentication
from accounts.models import get_request_account, Account, User, get_request_user, AccountApiToken
from connectors.handlers.bots.pager_duty_handler import handle_pd_incident
from connectors.handlers.bots.rootly_handler import handle_rootly_incident
from connectors.handlers.bots.zenduty_handler import handle_zd_incident
from connectors.handlers.bots.slack_bot_handler import handle_slack_event_callback
from connectors.models import Site
from playbooks.utils.decorators import web_api, account_post_api, api_auth_check
from utils.time_utils import current_epoch_timestamp
from protos.connectors.api_pb2 import GetSlackAppManifestResponse, GetSlackAppManifestRequest, \
    GetPagerDutyWebhookRequest, GetPagerDutyWebhookResponse, GetRootlyWebhookRequest, GetRootlyWebhookResponse, GetPagerDutyWebhookRequest, GetPagerDutyWebhookResponse, GetZendutyWebhookRequest, GetZendutyWebhookResponse
from utils.uri_utils import build_absolute_uri, construct_curl
from executor.crud.playbooks_crud import get_db_playbooks
from executor.workflows.tasks import test_workflow_notification
from protos.playbooks.workflow_pb2 import Workflow, WorkflowAction as WorkflowActionProto
from utils.proto_utils import dict_to_proto

logger = logging.getLogger(__name__)


@web_api(GetSlackAppManifestRequest)
def slack_manifest_create(request_message: GetSlackAppManifestRequest) -> \
        Union[GetSlackAppManifestResponse, HttpResponse]:
    account: Account = get_request_account()

    # read sample_manifest file string
    sample_manifest = """
display_information:
    name: MyFirstDroidApp
    description: App for Automating Investigation & Actions
    background_color: "#1f2126"
features:
    bot_user:
        display_name: MyFirstDroidApp
        always_online: true
    slash_commands:
        - command: /execute-playbook
          url: HOST_NAME/connectors/handlers/slack_bot/handle_slash_commands
          description: Executes a Playbook
          usage_hint: "[which playbook to execute]"
          should_escape: false
oauth_config:
    scopes:
        bot:
        - channels:history
        - chat:write
        - files:write
        - conversations.connect:manage
        - conversations.connect:write
        - groups:write
        - mpim:write
        - im:write
        - channels:manage
        - channels:read
        - groups:read
        - mpim:read
        - im:read
        - groups:history
        - commands
settings:
    event_subscriptions:
        request_url: HOST_NAME/connectors/handlers/slack_bot/handle_callback_events
        bot_events:
        - message.channels
        - member_joined_channel
        - member_left_channel
        - message.groups
        - channel_left
    org_deploy_enabled: false
    socket_mode_enabled: false
    token_rotation_enabled: false
    """

    host_name = Site.objects.filter(is_active=True).first()

    if not host_name:
        return GetSlackAppManifestResponse(success=BoolValue(value=False),
                                           app_manifest=StringValue(
                                               value="Host name not found for generating Manifest"))

    manifest_hostname = host_name.protocol + '://' + host_name.domain
    app_manifest = sample_manifest.replace("HOST_NAME", manifest_hostname)

    return GetSlackAppManifestResponse(success=BoolValue(value=True), app_manifest=StringValue(value=app_manifest))

@csrf_exempt
@api_view(['POST'])
def slack_bot_handle_slash_commands(request_message: HttpRequest) -> JsonResponse:
    channel_id = request_message.data.get('channel_id', [''])
    name = request_message.data.get('text', '')
    account = Account.objects.get(id=1)
    user = User.objects.get(id=1)
    playbooks = get_db_playbooks(account=account, is_active=True, playbook_name=name)
    playbook = playbooks.first()
    if not playbook:
        print(f"No Playbook with name: {name} found")
        return JsonResponse({'success': False, 'message': 'Playbook not found'}, status=500)
    workflow = {
        "name": "Sample Test Workflow",
        "schedule": {
            "type": "ONE_OFF",
            "one_off": {}
        },
        "playbooks": [
            {
                "id": playbook.id,
            }
        ],
        "entry_points": [
            {
                "type": "API",
                "api": {}
            }
        ],
        "actions": [
            {
                "type": "SLACK_MESSAGE",
                "slack_message": {
                    "slack_channel_id": channel_id
                }
            }
        ],
        "configuration": {
            "generate_summary": True,
            "global_variable_set": {}
        }
    }
    test_workflow_notification.delay(workflow_json=workflow,account_id=account.id, message_type=WorkflowActionProto.Type.SLACK_MESSAGE, user_email=user.email)
    print(f"Sending message to slack channel with the id: {channel_id}")
    message = f"{name} execution is in progress"
    return JsonResponse({'success': True, 'message': message}, status=200)


@csrf_exempt
@api_view(['POST'])
def slack_bot_handle_callback_events(request_message: HttpRequest) -> JsonResponse:
    current_epoch = current_epoch_timestamp()
    if not request_message.headers:
        return JsonResponse({'success': False, 'message': 'Missing request headers'}, status=400)

    if 'X-Slack-Request-Timestamp' not in request_message.headers:
        return JsonResponse({'success': False, 'message': 'Missing X-Slack-Request-Timestamp in request headers'},
                            status=400)

    request_timestamp = request_message.headers['X-Slack-Request-Timestamp']

    # reject messages older than 15 minutes (60 * 15 s)
    if current_epoch - int(request_timestamp) > 60 * 15:
        return JsonResponse("Invalid Message Received", status=403)

    data = request_message.data
    if data:
        if 'type' not in data:
            return JsonResponse({'success': False, 'message': 'Missing Event Type'}, status=400)
        d_type = data.get('type', '')
        if d_type == 'url_verification':
            return JsonResponse({'challenge': data.get('challenge', '')})
        elif d_type == 'event_callback':
            try:
                response = handle_slack_event_callback(data)
                if response:
                    return JsonResponse({'success': True, 'message': 'Slack Event Callback Handling Successful'})
                else:
                    return JsonResponse({'success': False, 'message': 'Slack Event Callback Handling failed'})
            except Exception as e:
                logger.error(f'Error handling slack event callback: {str(e)}')
                return JsonResponse({'success': False, 'message': f"Slack Event Callback Handling failed"},
                                    status=500)

        else:
            return JsonResponse({'success': False, 'message': f"Received invalid data type: {d_type}"}, status=400)
    return JsonResponse({'success': False, 'message': 'Slack Event Callback  Handling failed'}, status=400)


@web_api(GetPagerDutyWebhookRequest)
def pagerduty_generate_webhook(request_message: GetPagerDutyWebhookRequest) -> HttpResponse:
    account: Account = get_request_account()
    user: User = get_request_user()

    qs = account.account_api_token.filter(created_by=user)
    if qs:
        account_api_token = qs.first()
    else:
        api_token = AccountApiToken(account=account, created_by=user)
        api_token.save()
        account_api_token = api_token

    headers = {'Authorization': f'Bearer {account_api_token.key}'}
    location = settings.PAGERDUTY_WEBHOOK_LOCATION
    protocol = settings.PAGERDUTY_WEBHOOK_HTTP_PROTOCOL
    enabled = settings.PAGERDUTY_WEBHOOK_USE_SITE
    uri = build_absolute_uri(None, location, protocol, enabled)

    curl = construct_curl('POST', uri, headers=headers, payload=None)
    return HttpResponse(curl, content_type="text/plain", status=200)

@web_api(GetZendutyWebhookRequest)
def zenduty_generate_webhook(request_message: GetZendutyWebhookRequest) -> HttpResponse:
    account: Account = get_request_account()
    user: User = get_request_user()

    qs = account.account_api_token.filter(created_by=user)
    if qs:
        account_api_token = qs.first()
    else:
        api_token = AccountApiToken(account=account, created_by=user)
        api_token.save()
        account_api_token = api_token

    headers = {'Authorization': f'Bearer {account_api_token.key}'}
    location = settings.ZENDUTY_WEBHOOK_LOCATION
    protocol = settings.ZENDUTY_WEBHOOK_HTTP_PROTOCOL
    enabled = settings.ZENDUTY_WEBHOOK_USE_SITE
    uri = build_absolute_uri(None, location, protocol, enabled)

    curl = construct_curl('POST', uri, headers=headers, payload=None)
    return HttpResponse(curl, content_type="text/plain", status=200)

@web_api(GetRootlyWebhookRequest)
def rootly_generate_webhook(request_message: GetRootlyWebhookRequest) -> HttpResponse:
    account: Account = get_request_account()
    user: User = get_request_user()

    qs = account.account_api_token.filter(created_by=user)
    if qs:
        account_api_token = qs.first()
    else:
        api_token = AccountApiToken(account=account, created_by=user)
        api_token.save()
        account_api_token = api_token

    headers = {'Authorization': f'Bearer {account_api_token.key}'}
    location = settings.ROOTLY_WEBHOOK_LOCATION
    protocol = settings.ROOTLY_WEBHOOK_HTTP_PROTOCOL
    enabled = settings.ROOTLY_WEBHOOK_USE_SITE
    uri = build_absolute_uri(None, location, protocol, enabled)

    curl = construct_curl('POST', uri, headers=headers, payload=None)
    return HttpResponse(curl, content_type="text/plain", status=200)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([AccountApiTokenAuthentication])
@api_auth_check
def pagerduty_handle_incidents(request_message: HttpRequest) -> JsonResponse:
    try:
        data = request_message.data
        handle_pd_incident(data)
        return JsonResponse({'success': True, 'message': 'pagerduty incident Handling sucessfull'}, status=200)
    except Exception as e:
        logger.error(f'Error handling pagerduty incident: {str(e)}')
        return JsonResponse({'success': False, 'message': f"pagerduty incident Handling failed"}, status=500)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([AccountApiTokenAuthentication])
@api_auth_check
def rootly_handle_incidents(request_message: HttpRequest) -> JsonResponse:
    try:
        data = request_message.data
        handle_rootly_incident(data)
        return JsonResponse({'success': True, 'message': 'rootly incident Handling sucessfull'}, status=200)
    except Exception as e:
        logger.error(f'Error handling rootly incident: {str(e)}')
        return JsonResponse({'success': False, 'message': f"rootly incident Handling failed"}, status=500)
    
@csrf_exempt
@api_view(['POST'])
@authentication_classes([AccountApiTokenAuthentication])
@api_auth_check
def zenuty_handle_incidents(request_message: HttpRequest) -> JsonResponse:
    try:
        data = request_message.data
        handle_zd_incident(data)
        return JsonResponse({'success': True, 'message': 'zenduty incident Handling sucessfull'}, status=200)
    except Exception as e:
        logger.error(f'Error handling zenduty incident: {str(e)}')
        return JsonResponse({'success': False, 'message': f"zenduty incident Handling failed"}, status=500)
