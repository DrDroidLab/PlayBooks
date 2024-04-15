import traceback

from django.conf import settings
from django.core.cache import caches
from rest_framework import exceptions

from accounts.models import AccountApiToken, Account


class AccountApiTokenCache:
    def __init__(self, cache_key, enabled):
        self._cache_key = cache_key
        self._enabled = enabled
        # Set the timeout to 30 seconds for api keys.
        self._timeout = 30

    def _get(self, api_key: str):
        try:
            token = AccountApiToken.objects.get(key=api_key)
        except AccountApiToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')
        return token

    def get(self, api_key):
        if not self._enabled:
            return self._get(api_key)

        key = f'account_api_token:{api_key}'
        value = caches[self._cache_key].get(key)
        if value is not None:
            return value
        token = self._get(api_key)
        caches[self._cache_key].set(key, token, timeout=self._timeout)
        return token


class AccountCache:
    def __init__(self, cache_key, enabled):
        self._cache_key = cache_key
        self._enabled = enabled

    def _is_whitelisted(self, account_id):
        return Account.objects.get(id=account_id).is_whitelisted

    def is_whitelisted(self, account_id):
        if not self._enabled:
            return self._is_whitelisted(account_id)
        key = f'account:{account_id}:is_whitelisted'
        value = caches[self._cache_key].get(key)
        if value is not None:
            return value
        enabled = self._is_whitelisted(account_id)
        caches[self._cache_key].set(key, enabled, timeout=30)
        return enabled

    def daily_account_quota(self, date, account_id, quota):
        key = f'account:{account_id}:{quota}:{date}'
        value = caches[self._cache_key].get(key)
        if value is not None:
            return value
        caches[self._cache_key].set(key, 0, timeout=86400)
        return 0

    def incr_daily_account_quota(self, date, account_id, quota, delta):
        key = f'account:{account_id}:{quota}:{date}'
        try:
            caches[self._cache_key].incr(key, delta)
        except ValueError:
            caches[self._cache_key].set(key, delta, timeout=86400)


class AccountForgotPasswordTokenCache:
    def __init__(self, cache_key, enabled):
        self._cache_key = cache_key
        self._enabled = enabled

    def get(self, email):
        try:
            key = f'reset_password_token:{email}'
            return caches[self._cache_key].get(key)
        except Exception as ex:
            print(
                f"Error while getting reset password token from cache:: {traceback.format_exception(type(ex), ex, ex.__traceback__)}")

    def create_or_update(self, email, token, time_to_expire_s=None):
        try:
            if not time_to_expire_s:
                time_to_expire_s = 60 * 60
            key = f'reset_password_token:{email}'
            caches[self._cache_key].set(key, token, time_to_expire_s)
        except Exception as ex:
            print(
                f"Error while setting reset password token in cache:: {traceback.format_exception(type(ex), ex, ex.__traceback__)}")

    def delete(self, email):
        try:
            key = f'reset_password_token:{email}'
            value = caches[self._cache_key].delete(key)
            return value
        except Exception as ex:
            print(
                f"Error while deleting reset password token from cache:: {traceback.format_exception(type(ex), ex, ex.__traceback__)}")


GLOBAL_ACCOUNT_API_TOKEN_CACHE = AccountApiTokenCache(**settings.GLOBAL_ACCOUNT_API_TOKEN_CACHE)
GLOBAL_ACCOUNT_CACHE = AccountCache(**settings.GLOBAL_ACCOUNT_CACHE)
GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE = AccountForgotPasswordTokenCache(
    **settings.GLOBAL_ACCOUNT_PASSWORD_CONTEXT_CACHE)
