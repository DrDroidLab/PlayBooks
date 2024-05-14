from django.urls import path

from . import views as asset_views

urlpatterns = [
    path('models/options', asset_views.assets_models_options),
    path('models/get', asset_views.assets_models_get),
    path('models/refresh', asset_views.assets_models_refresh),
]
