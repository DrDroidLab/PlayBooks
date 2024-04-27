from django.urls import path

from . import views as workflow_views

urlpatterns = [

    # Workflow CRUD
    path('get', workflow_views.workflows_get),
    path('create', workflow_views.workflows_create),
    path('update', workflow_views.workflows_update),

    # Test Notification
    path('test_notification', workflow_views.test_workflows_notification),

    # Workflow Execution APIs
    path('execute', workflow_views.workflows_execute),
    path('executions/get', workflow_views.workflows_execution_get),
    path('executions/list', workflow_views.workflows_execution_list),

]
