from django.urls import path

from . import views as connector_views

urlpatterns = [
    path('create', connector_views.connectors_create),
    path('list', connector_views.connectors_list),
    path('update', connector_views.connectors_update),
    path('keys/options', connector_views.connector_keys_options),
    path('keys/get', connector_views.connector_keys_get),
    path('playbooks/builder/sources/options', connector_views.playbooks_sources_options),
]
