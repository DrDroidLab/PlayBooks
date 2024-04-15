import threading
from dataclasses import dataclass
from typing import Dict

from django.http import HttpRequest

_ACCOUNT_KEY = 'account'
_USER_KEY = 'user'


@dataclass
class _RequestStore:
    request: HttpRequest
    variables: Dict


class _RequestStorage(threading.local):
    def __init__(self):
        super().__init__()
        self.request_store = _RequestStore(None, {})

    def reset(self):
        self.request_store = _RequestStore(None, {})

    def add_request(self, request):
        self.request_store.request = request

    def get_request(self):
        return self.request_store.request

    def add_variable(self, key, val):
        if not self.request_store.request:
            raise RuntimeError(f'Trying to add variable {key} with no active request')
        self.request_store.variables[key] = val

    def get_variable(self, key):
        if key not in self.request_store.request:
            return None
        return self.request_store.variables[key]


_storage = _RequestStorage()


def set_current_request(request):
    _storage.add_request(request)


def reset_request_storage():
    _storage.reset()


def get_current_request():
    return _storage.get_request()


def set_current_request_account(account):
    _storage.add_variable(_ACCOUNT_KEY, account)


def get_current_request_account():
    return _storage.get_variable(_ACCOUNT_KEY)


def set_current_request_user(user):
    _storage.add_variable(_USER_KEY, user)


def get_current_request_user():
    return _storage.get_variable(_USER_KEY)
