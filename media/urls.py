from django.urls import path

from media.views import ImageView, CSVView, TextView

urlpatterns = [
    path('images/', ImageView.as_view(), name='image-detail'),
    path('csv_files/', CSVView.as_view(), name='csv-file-detail'),
    path('text_files/', TextView.as_view(), name='text-file-detail'),
]
