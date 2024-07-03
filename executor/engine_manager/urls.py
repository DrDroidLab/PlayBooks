from django.urls import path

from . import views as engine_manager_views

urlpatterns = [
    # Engine Manager APIs
    path('search', engine_manager_views.search),
]
