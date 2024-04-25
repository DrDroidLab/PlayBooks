from django.urls import path

from . import views as workflow_views

urlpatterns = [

    # Workflow CRUD
    path('get', workflow_views.workflows_get),
    path('create', workflow_views.workflows_create),
    path('update', workflow_views.workflows_update),

    # Workflow Execution APIs
    path('execute', workflow_views.workflows_execute),
    path('executions/get', workflow_views.workflows_execution_get),
    path('executions/list', workflow_views.workflows_execution_list),

]
