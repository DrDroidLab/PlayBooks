from django.urls import path

from . import views as handler_views

urlpatterns = [
    # Slack event subscription webhook
    path('slack_bot/handle_callback_events', handler_views.slack_bot_handle_callback_events),
    path('slack_bot/app_manifest_create', handler_views.slack_manifest_create),
    path('pagerduty/handle_incidents', handler_views.pagerduty_handle_incidents),
    path('pagerduty/generate/webhook', handler_views.pagerduty_generate_webhook),
    path('rootly/handle_incidents', handler_views.rootly_handle_incidents),
    path('rootly/generate/webhook', handler_views.rootly_generate_webhook)
]
