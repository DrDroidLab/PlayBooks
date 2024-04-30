from django.urls import path

from . import views as handler_views

urlpatterns = [
    # Slack event subscription webhook
    path('integrations/handlers/slack_bot/handle_callback_events', handler_views.slack_bot_handle_callback_events),
]
