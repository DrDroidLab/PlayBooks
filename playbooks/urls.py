"""playbooks URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from playbooks import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('connectors/', include('connectors.urls')),
    path('connectors/assets/', include('connectors.assets.urls')),
    path('connectors/handlers/', include('connectors.handlers.urls')),
    path('executor/', include('executor.urls')),
    path('executor/workflows/', include('executor.workflows.urls')),
    path('executor/engine/', include('executor.engine_manager.urls')),
    path('pb/', include('executor.urls')),
    path('media/', include('media.urls')),
    path('', include('django_prometheus.urls')),
    path('', views.index),
]
