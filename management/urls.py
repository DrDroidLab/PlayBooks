from django.urls import path

from . import views as management_views

urlpatterns = [
    path('version-info', management_views.version_info, name='version-info'),
]
