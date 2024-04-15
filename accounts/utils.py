from allauth.account.utils import has_verified_email
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from accounts.cache import GLOBAL_ACCOUNT_CACHE
from playbooks.threadlocal import get_current_request
from utils.time import get_current_day_epoch
from utils.uri_utils import build_absolute_uri

_event_count_quota_key = 'event_count'


class AccountDailyEventQuotaReached(Exception):
    pass


def get_account_quota_error_message():
    return f'Account reached daily event quota. Please reach out to enable more events for account.'


def check_account_event_quota(account_id, event_count):
    date = get_current_day_epoch()
    GLOBAL_ACCOUNT_CACHE.incr_daily_account_quota(date, account_id, _event_count_quota_key, event_count)
    return GLOBAL_ACCOUNT_CACHE.daily_account_quota(
        date, account_id,
        _event_count_quota_key
    ) <= settings.ACCOUNT_DAILY_EVENT_QUOTA


def do_process_events(account_id, event_count):
    if GLOBAL_ACCOUNT_CACHE.is_whitelisted(account_id):
        return True
    if check_account_event_quota(account_id, event_count):
        return True
    raise AccountDailyEventQuotaReached()


def is_request_user_email_verified():
    user = get_current_request().user
    return has_verified_email(user)


def create_random_password():
    import random
    import string

    N = 10  # password length

    # Allowed string constants
    allowedChars = string.ascii_letters + string.digits + string.punctuation

    # Genereate password
    password = ''.join(random.choice(allowedChars) for _ in range(N))
    return password


def generate_reset_password_hyperlink(token, email):
    location = settings.RESET_PASSWORD_PAGE_URL.format(token, email)
    protocol = settings.ALERT_SITE_HTTP_PROTOCOL
    enabled = settings.ALERT_USE_SITE
    try:
        uri = build_absolute_uri(None, location, protocol, enabled)
    except ImproperlyConfigured:
        return ""
    return uri


def generate_signup_hyperlink(signup_domain):
    protocol = settings.ALERT_SITE_HTTP_PROTOCOL
    try:
        uri = protocol + '://' + signup_domain + '/signup'
    except:
        return ""
    return uri
