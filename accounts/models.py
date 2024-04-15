import os

import binascii
from allauth.account.utils import has_verified_email
from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.functional import cached_property
from google.protobuf.timestamp_pb2 import Timestamp
from google.protobuf.wrappers_pb2 import BoolValue

from protos.accounts.account_pb2 import AccountApiToken as AccountApiTokenProto, User as UserProto, UserFlags
from playbooks.threadlocal import get_current_request, get_current_request_account, set_current_request_account, \
    get_current_request_user, set_current_request_user


class Account(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='owned_account',
        on_delete=models.SET_NULL, verbose_name="Owner", null=True
    )
    is_whitelisted = models.BooleanField(default=False)

    class Meta:
        verbose_name = "account"
        verbose_name_plural = "accounts"
        unique_together = [['owner'], ]

    def __str__(self):
        return f'{self.id}'


class MissingAccountException(ValueError):
    pass


def get_request_account():
    account: Account = get_current_request_account()
    if account:
        return account

    user: User = get_request_user()

    if user:
        account: Account = user.account
        set_current_request_account(account)
    else:
        raise MissingAccountException(f'Missing user info')

    return account


def get_request_user():
    user: User = get_current_request_user()
    if user:
        return user

    request = get_current_request()

    if request.user.is_authenticated:
        user = request.user
        set_current_request_user(user)
    else:
        raise MissingAccountException(f'User is unauthenticated. Missing user info')

    return user


class MissingOrgHeaderException(ValueError):
    pass


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """

    def create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        abstract = False
        unique_together = [['account', 'email'], ]

    def __str__(self):
        if self.account:
            return f'{self.account}:{self.email}'
        else:
            return self.email

    @property
    def user_flags_proto(self):
        return UserFlags(
            is_email_verified=BoolValue(value=has_verified_email(self)),
            is_account_owner=BoolValue(value=(self.account.owner == self))
        )

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def proto(self):
        return UserProto(id=self.id, email=self.email, first_name=self.first_name, last_name=self.last_name,
                         user_flags=self.user_flags_proto)


class UserInvitation(models.Model):
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    invitee_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    invite_token = models.CharField(max_length=256, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    joined_user_id = models.IntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "user invitation"
        verbose_name_plural = "user invitations"

    def __str__(self):
        return f'{self.email}'


class ApiToken(models.Model):
    key = models.CharField("Key", max_length=40, primary_key=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='api_token',
        on_delete=models.CASCADE, verbose_name="User"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'ApiToken'
        verbose_name_plural = 'ApiTokens'

    def __str__(self):
        return f'{self.key}'

    @classmethod
    def generate_key(cls):
        return binascii.hexlify(os.urandom(20)).decode()

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    @cached_property
    def created_at_timestamp(self):
        timestamp = Timestamp()
        timestamp.FromDatetime(self.created_at)
        return timestamp


class AccountApiToken(models.Model):
    key = models.CharField("Key", max_length=40, primary_key=True)
    account = models.ForeignKey(Account, related_name='account_api_token', on_delete=models.CASCADE)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='account_api_token',
        on_delete=models.CASCADE, verbose_name="User"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'AccountApiToken'
        verbose_name_plural = 'AccountApiTokens'

    def __str__(self):
        return f'{self.account_id}:{self.key}'

    @classmethod
    def generate_key(cls):
        return binascii.hexlify(os.urandom(20)).decode()

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    @cached_property
    def created_at_timestamp(self):
        timestamp = Timestamp()
        timestamp.FromDatetime(self.created_at)
        return timestamp

    @cached_property
    def proto(self):
        return AccountApiTokenProto(
            key=self.key,
            created_by=self.created_by.email,
            created_at=self.created_at_timestamp,
            account_id=self.account_id
        )


class AccountApiTokenUser:
    is_active = True

    def __init__(self, account_id):
        self._account_id = account_id

    def __str__(self):
        return f'AccountUser {self._account_id}'

    @cached_property
    def account(self):
        return Account(id=self._account_id)

    @cached_property
    def account_id(self):
        return self._account_id

    def __eq__(self, other):
        return self.account_id == other.account_id

    def __ne__(self, other):
        return not self.__eq__(other)

    def __hash__(self):
        return hash(self.account_id)

    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True

    def save(self):
        raise NotImplementedError("Token users have no DB representation")

    def delete(self):
        raise NotImplementedError("Token users have no DB representation")

    def set_password(self, raw_password):
        raise NotImplementedError("Token users have no DB representation")

    def check_password(self, raw_password):
        raise NotImplementedError("Token users have no DB representation")
