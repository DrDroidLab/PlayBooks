from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

from connectors.handlers.bots.slack_bot_handler import handle_slack_event_callback
from playbooks.utils.utils import current_epoch_timestamp


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
                return JsonResponse({'success': False, 'message': f"Slack Event Callback Handling failed: {str(e)}"},
                                    status=500)

        else:
            return JsonResponse({'success': False, 'message': f"Received invalid data type: {d_type}"}, status=400)
    return JsonResponse({'success': False, 'message': 'Slack Event Callback  Handling failed'}, status=400)
