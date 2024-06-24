from django.urls import path

from . import views as handler_views

urlpatterns = [
    # Slack event subscription webhook
    path('slack_bot/handle_callback_events', handler_views.slack_bot_handle_callback_events),
    path('slack_bot/app_manifest_create', handler_views.slack_manifest_create),
    path('pagerduty/handle_incidents', handler_views.pagerduty_handle_incidents),
    path('generate/webhook', handler_views.pd_generate_webhook)
]
