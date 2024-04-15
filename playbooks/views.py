from django.http import HttpRequest, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods


@login_required()
@require_http_methods(['GET'])
def index(request: HttpRequest):
    # Process the events and metadata and put it into db
    return HttpResponse(f'Welcome to the world of playbooks: {request.user}')
