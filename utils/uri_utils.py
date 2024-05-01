import json
import urllib
from urllib.parse import urlsplit

from django.contrib.sites.models import Site as DjangoSite
from django.conf import settings

from connectors.models import Site
from django.core.exceptions import ImproperlyConfigured


def get_db_site():
    sites = Site.objects.filter(is_active=True)
    if sites:
        return sites.first()
    return None


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

        site = get_db_site()
        if site:
            if site.protocol:
                protocol = site.protocol
            domain = site.domain
        else:
            site = DjangoSite.objects.get_current()
            domain = site.domain

        bits = urlsplit(location)
        if not (bits.scheme and bits.netloc):
            uri = "{protocol}://{domain}{url}".format(
                protocol=protocol,
                domain=domain,
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


def construct_curl(method, uri, headers, params=None, payload=None):
    curl_command = f"curl -X {method.upper()}"

    # Add headers to the cURL command
    for key, value in headers.items():
        curl_command += f" -H '{key}: {value}'"

    # Add request parameters to the URI
    if params:
        param_string = "&".join([f"{key}={value}" for key, value in params.items()])
        uri += f"?{param_string}"

    # Add payload to the cURL command (if applicable)
    if payload and method.lower() in ["post", "put", "patch"]:
        payload_string = json.dumps(payload)
        curl_command += f" -d '{payload_string}'"

    # Add the URI to the cURL command
    curl_command += f" '{uri}'"

    return curl_command
