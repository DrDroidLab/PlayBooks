from typing import Union
import logging

from django.http import HttpRequest, JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from google.protobuf.wrappers_pb2 import BoolValue, StringValue
from rest_framework.decorators import api_view

from accounts.models import get_request_account, Account
from connectors.handlers.bots.slack_bot_handler import handle_slack_event_callback
from connectors.models import Site
from playbooks.utils.decorators import web_api
from utils.time_utils import current_epoch_timestamp
from protos.base_pb2 import Message
from protos.connectors.api_pb2 import GetSlackAppManifestResponse, GetSlackAppManifestRequest

logger = logging.getLogger(__name__)

@web_api(GetSlackAppManifestRequest)
def slack_manifest_create(request_message: GetSlackAppManifestRequest) -> \
        Union[GetSlackAppManifestResponse, HttpResponse]:
    account: Account = get_request_account()
    host_name = request_message.host_name

    if not host_name or not host_name.value:
        return GetSlackAppManifestResponse(success=BoolValue(value=False), message=Message(title='Host name not found'))

    # read sample_manifest file string
    sample_manifest = """
        display_information:
            name: MyDroid
            description: App for Automating Investigation & Actions
            background_color: "#1f2126"
        features:
            bot_user:
                display_name: MyDroid
                always_online: true
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
        settings:
            event_subscriptions:
                request_url: HOST_NAME/connectors/handlers/slack_bot/handle_callback_events
                bot_events:
                - message.channels
            org_deploy_enabled: false
            socket_mode_enabled: false
            token_rotation_enabled: false
    """

    app_manifest = sample_manifest.replace("HOST_NAME", host_name.value)

    site_domain = host_name.value.replace('https://', '').replace('http://', '').split("/")[0]
    active_sites = Site.objects.filter(is_active=True)
    http_protocol = 'https' if host_name.value.startswith('https://') else 'http'

    if active_sites:
        site = active_sites.first()
        site.domain = site_domain
        site.name = 'MyDroid'
        site.protocol = http_protocol
        site.save()
    else:
        Site.objects.create(domain=site_domain, name='MyDroid', protocol=http_protocol, is_active=True)

    return GetSlackAppManifestResponse(success=BoolValue(value=True), app_manifest=StringValue(value=app_manifest))


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
