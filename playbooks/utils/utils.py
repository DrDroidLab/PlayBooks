import time
from urllib.parse import urlsplit

import croniter
import pytz
from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured


def current_milli_time():
    return round(time.time() * 1000)


def current_epoch_timestamp():
    return int(time.time())


def current_datetime(timezone=pytz.utc):
    return datetime.now(timezone)


def calculate_cron_times(rule, start_time=None, end_time=None):
    if start_time is None:
        start_time = current_datetime()
    if end_time is None:
        end_time = start_time + timedelta(days=1)
    cron = croniter.croniter(rule, start_time)

    cron_times = [start_time]
    current_time = start_time
    while current_time < end_time:
        next_cron = cron.get_next(datetime)
        if next_cron < end_time:
            cron_times.append(next_cron)
        current_time = next_cron
    return cron_times


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
