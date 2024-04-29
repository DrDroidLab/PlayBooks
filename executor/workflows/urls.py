from django.urls import path

from . import views as workflow_views

urlpatterns = [

    # Workflow CRUD
    path('get', workflow_views.workflows_get),
    path('create', workflow_views.workflows_create),
    path('update', workflow_views.workflows_update),

    # Test Notification
    path('test_notification', workflow_views.test_workflows_notification),

    # Workflows Execution APIs
    path('execute', workflow_views.workflows_execute),
    path('executions/get', workflow_views.workflows_execution_get),
    path('executions/list', workflow_views.workflows_execution_list),

    # Workflows API based executions
    path('api/execute', workflow_views.workflows_api_execute),
    path('api/executions/get', workflow_views.workflows_execution_api_get),

]
