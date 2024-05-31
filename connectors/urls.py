from django.urls import path

from . import views as connector_views

urlpatterns = [
    path('create', connector_views.connectors_create),
    path('list', connector_views.connectors_list),
    path('update', connector_views.connectors_update),
    path('keys/options', connector_views.connector_keys_options),
    path('keys/get', connector_views.connector_keys_get),
    path('test_connection', connector_views.connectors_test_connection),

    path('playbooks/builder/sources/options', connector_views.playbooks_sources_options),

    path('connected_playbooks/get', connector_views.connected_playbooks_get),

    # Slack alert trigger options
    path('slack_alert_trigger/options/get', connector_views.slack_alert_trigger_options_get),
    path('slack/alerts/search', connector_views.slack_alerts_search),
    path('slack/app_manifest/create', connector_views.slack_manifest_create),

]
