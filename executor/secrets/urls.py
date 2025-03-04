from django.urls import path
from executor.secrets import views

urlpatterns = [
    path('list/', views.secrets_list, name='secrets_list'),
    path('get/', views.secret_get, name='secret_get'),
    path('create/', views.secret_create, name='secret_create'),
    path('update/', views.secret_update, name='secret_update'),
    path('delete/', views.secret_delete, name='secret_delete'),
] 