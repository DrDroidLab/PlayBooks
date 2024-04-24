from django.http import JsonResponse, HttpResponse
from django.views import View

from media.models import Image


class ImageView(View):
    def get(self, request):
        image_uuid = request.GET.get('uuid')

        try:
            image = Image.objects.get(uuid=image_uuid)
        except Image.DoesNotExist:
            return JsonResponse({'error': 'Image not found'}, status=404)

        response = HttpResponse(image.image_data, content_type='image/png')
        response['Content-Disposition'] = 'attachment; filename="{}.png"'.format(image.title)
        return response
