from django.urls import path

from media.views import ImageView

urlpatterns = [
    path('images/', ImageView.as_view(), name='image-detail'),
]
