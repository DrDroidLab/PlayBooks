from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured


def build_absolute_uri(request, location, protocol=None, enabled=False):
    """request.build_absolute_uri() helper
    like request.build_absolute_uri, but gracefully handling
    the case where request is None.
    """
    if not protocol:
        protocol = settings.SITE_DEFAULT_HTTP_PROTOCOL

    if request is None:
        if not enabled:
            raise ImproperlyConfigured("Passing `request=None` requires `sites` to be enabled")

        site = Site.objects.get_current()
        bits = urlsplit(location)
        if not (bits.scheme and bits.netloc):
            uri = "{protocol}://{domain}{url}".format(
                protocol=protocol,
                domain=site.domain,
                url=location,
            )
        else:
            uri = location
    else:
        uri = request.build_absolute_uri(location)
    # NOTE: We only force a protocol if we are instructed to do so
    # via the `protocol` parameter, or, if the default is set to
    # HTTPS. The latter keeps compatibility with the debatable use
    # case of running your site under both HTTP and HTTPS, where one
    # would want to make sure HTTPS links end up in password reset
    # mails even while they were initiated on an HTTP password reset
    # form.
    # (end NOTE)
    if protocol:
        uri = protocol + ":" + uri.partition(":")[2]
    return uri
