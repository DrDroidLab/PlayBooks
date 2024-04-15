from playbooks.threadlocal import set_current_request, reset_request_storage

try:
    from django.utils.deprecation import MiddlewareMixin
except ImportError:
    MiddlewareMixin = object


class RequestThreadLocalMiddleware(MiddlewareMixin):
    """Middleware that puts the request object in thread local storage."""

    def process_request(self, request):
        set_current_request(request)

    def process_response(self, request, response):
        reset_request_storage()
        return response

    def process_exception(self, request, exception):
        reset_request_storage()
