from django.http import JsonResponse, HttpResponse
from django.views import View

from media.models import Image, CSVFile, TextFile


class ImageView(View):
    def get(self, request):
        image_uuid = request.GET.get('uuid')

        try:
            image = Image.objects.get(uuid=image_uuid)
        except Image.DoesNotExist:
            return JsonResponse({'error': 'Image not found'}, status=404)

        try:
            response = HttpResponse(image.image_data, content_type='image/png')
            response['Content-Disposition'] = 'attachment; filename="{}.png"'.format(image.title)
            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class CSVView(View):
    def get(self, request):
        csv_uuid = request.GET.get('uuid')
        try:
            csv = CSVFile.objects.get(uuid=csv_uuid)
        except CSVFile.DoesNotExist:
            return JsonResponse({'error': 'CSV not found'}, status=404)

        try:
            csv_text = csv.fetch_csv_from_blob()
            response = HttpResponse(content_type='text/csv')
            title = csv.title
            if not title or title == 'Untitled':
                title = 'Untitled-{}'.format(csv.uuid)
            if not title.endswith('.csv'):
                title += '.csv'
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(title)
            response.write(csv_text)
            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class TextView(View):
    def get(self, request):
        text_uuid = request.GET.get('uuid')
        try:
            text = TextFile.objects.get(uuid=text_uuid)
        except TextFile.DoesNotExist:
            return JsonResponse({'error': 'Text not found'}, status=404)

        try:
            text_text = text.fetch_text_from_blob()
            response = HttpResponse(content_type='text/plain')
            title = text.title
            if not title or title == 'Untitled':
                title = 'Untitled-{}'.format(text.uuid)
            if not title.endswith('.md'):
                title += '.md'
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(title)
            response.write(text_text)
            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
