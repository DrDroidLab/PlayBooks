from django.urls import path

from . import views as executor_views

urlpatterns = [
    # Executor Run APIs
    path('task/run', executor_views.task_run),  # Deprecated
    path('task/run/v2', executor_views.task_run_v2),  # Deprecated
    path('task/run/v3', executor_views.task_run_v3),

    path('step/run', executor_views.step_run),  # Deprecated
    path('step/run/v2', executor_views.step_run_v2),  # Deprecated
    path('step/run/v3', executor_views.step_run_v3),

    path('playbook/run', executor_views.playbook_run),  # Deprecated
    path('playbook/run/v2', executor_views.playbook_run_v2),

    # Playbooks CRUD
    path('get', executor_views.playbooks_get),  # Deprecated
    path('get/v2', executor_views.playbooks_get_v2),

    path('create', executor_views.playbooks_create),  # Deprecated
    path('create/v2', executor_views.playbooks_create_v2),

    path('update', executor_views.playbooks_update),  # Deprecated
    path('update/v2', executor_views.playbooks_update_v2),

    # Playbooks Execution APIs
    path('execute', executor_views.playbooks_execute),
    path('execution/get', executor_views.playbooks_execution_get),  # Deprecated
    path('execution/get/v2', executor_views.playbooks_execution_get_v2),
    path('executions/list', executor_views.playbooks_executions_list),
    path('execution/create', executor_views.playbooks_execution_create),
    path('execution/step/execute', executor_views.playbooks_execution_step_execute),
    path('execution/state/update', executor_views.playbooks_execution_state_update),

    # Playbooks API based executions
    path('api/execute', executor_views.playbooks_api_execute),
    path('api/executions/get', executor_views.playbooks_api_execution_get),  # Deprecated
    path('api/executions/get/v2', executor_views.playbooks_api_execution_get_v2),

    # Templates
    path("templates", executor_views.playbooks_templates),

    # Options
    path('builder/options', executor_views.playbooks_builder_options),
]
