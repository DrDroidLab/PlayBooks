from django.urls import path

from . import views as executor_views

urlpatterns = [
    # Executor Run APIs
    path('task/run', executor_views.task_run),
    path('task/run/v2', executor_views.task_run_v2),
    path('step/run', executor_views.step_run),
    path('step/run/v2', executor_views.step_run_v2),
    path('playbook/run', executor_views.playbook_run),

    # Playbooks CRUD
    path('get', executor_views.playbooks_get),
    path('create', executor_views.playbooks_create),
    path('update', executor_views.playbooks_update),

    # Playbooks Execution APIs
    path('execute', executor_views.playbooks_execute),
    path('execution/get', executor_views.playbooks_execution_get),
    path('executions/list', executor_views.playbooks_executions_list),

    # Playbooks API based executions
    path('api/execute', executor_views.playbooks_api_execute),
    path('api/executions/get', executor_views.playbooks_api_execution_get),

    # Templates
    path("templates", executor_views.playbooks_templates),

    # Options
    path('builder/options', executor_views.playbooks_builder_options),
]
