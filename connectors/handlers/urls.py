from django.urls import path

from . import views as handler_views

urlpatterns = [
    # Slack bot webhooks
    path('slack_bot/handle_callback_events', handler_views.slack_bot_handle_callback_events),
    path('slack_bot/app_manifest_create', handler_views.slack_manifest_create),
    path('slack_bot/command_execute_playbook', handler_views.slack_bot_command_execute_playbook),

    # Pagerduty bot webhooks
    path('pagerduty/handle_incidents', handler_views.pagerduty_handle_incidents),
    path('pagerduty/generate/webhook', handler_views.pagerduty_generate_webhook),

    # Rootly bot webhooks
    path('rootly/handle_incidents', handler_views.rootly_handle_incidents),
    path('rootly/generate/webhook', handler_views.rootly_generate_webhook),

    # Zen duty bot webhooks
    path('zenduty/generate/webhook', handler_views.zenduty_generate_webhook),
    path('zenduty/handle_incidents', handler_views.zenuty_handle_incidents),
]
