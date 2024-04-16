from django.urls import path

from . import views as executor_views

urlpatterns = [
    path('task/run', executor_views.task_run),
    path('step/run', executor_views.step_run),
]
