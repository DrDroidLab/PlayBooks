"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import collections.abc
import google.protobuf.descriptor
import google.protobuf.internal.containers
import google.protobuf.message
import google.protobuf.wrappers_pb2
import protos.accounts.account_pb2
import protos.base_pb2
import sys

if sys.version_info >= (3, 8):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class GetAccountApiTokensRequest(google.protobuf.message.Message):
    """///////////////////  Api Tokens APIs  /////////////////////"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    META_FIELD_NUMBER: builtins.int
    @property
    def meta(self) -> protos.base_pb2.Meta: ...
    def __init__(
        self,
        *,
        meta: protos.base_pb2.Meta | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["meta", b"meta"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["meta", b"meta"]) -> None: ...

global___GetAccountApiTokensRequest = GetAccountApiTokensRequest

@typing_extensions.final
class GetAccountApiTokensResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    META_FIELD_NUMBER: builtins.int
    ACCOUNT_API_TOKENS_FIELD_NUMBER: builtins.int
    @property
    def meta(self) -> protos.base_pb2.Meta: ...
    @property
    def account_api_tokens(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.accounts.account_pb2.AccountApiToken]: ...
    def __init__(
        self,
        *,
        meta: protos.base_pb2.Meta | None = ...,
        account_api_tokens: collections.abc.Iterable[protos.accounts.account_pb2.AccountApiToken] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["meta", b"meta"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["account_api_tokens", b"account_api_tokens", "meta", b"meta"]) -> None: ...

global___GetAccountApiTokensResponse = GetAccountApiTokensResponse

@typing_extensions.final
class CreateAccountApiTokenRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    def __init__(
        self,
    ) -> None: ...

global___CreateAccountApiTokenRequest = CreateAccountApiTokenRequest

@typing_extensions.final
class CreateAccountApiTokenResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    SUCCESS_FIELD_NUMBER: builtins.int
    ACCOUNT_API_TOKEN_FIELD_NUMBER: builtins.int
    @property
    def success(self) -> google.protobuf.wrappers_pb2.BoolValue: ...
    @property
    def account_api_token(self) -> protos.accounts.account_pb2.AccountApiToken: ...
    def __init__(
        self,
        *,
        success: google.protobuf.wrappers_pb2.BoolValue | None = ...,
        account_api_token: protos.accounts.account_pb2.AccountApiToken | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["account_api_token", b"account_api_token", "success", b"success"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["account_api_token", b"account_api_token", "success", b"success"]) -> None: ...

global___CreateAccountApiTokenResponse = CreateAccountApiTokenResponse

@typing_extensions.final
class DeleteAccountApiTokenRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ACCOUNT_API_TOKEN_KEY_FIELD_NUMBER: builtins.int
    account_api_token_key: builtins.str
    def __init__(
        self,
        *,
        account_api_token_key: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["account_api_token_key", b"account_api_token_key"]) -> None: ...

global___DeleteAccountApiTokenRequest = DeleteAccountApiTokenRequest

@typing_extensions.final
class DeleteAccountApiTokenResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    SUCCESS_FIELD_NUMBER: builtins.int
    @property
    def success(self) -> google.protobuf.wrappers_pb2.BoolValue: ...
    def __init__(
        self,
        *,
        success: google.protobuf.wrappers_pb2.BoolValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["success", b"success"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["success", b"success"]) -> None: ...

global___DeleteAccountApiTokenResponse = DeleteAccountApiTokenResponse

@typing_extensions.final
class GetUserRequest(google.protobuf.message.Message):
    """///////////////////  User APIs  /////////////////////"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    def __init__(
        self,
    ) -> None: ...

global___GetUserRequest = GetUserRequest

@typing_extensions.final
class GetUserResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    USER_FIELD_NUMBER: builtins.int
    @property
    def user(self) -> protos.accounts.account_pb2.User: ...
    def __init__(
        self,
        *,
        user: protos.accounts.account_pb2.User | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["user", b"user"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["user", b"user"]) -> None: ...

global___GetUserResponse = GetUserResponse

@typing_extensions.final
class GetVersionInfoResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    CURRENT_VERSION_FIELD_NUMBER: builtins.int
    LATEST_VERSION_FIELD_NUMBER: builtins.int
    SHOULD_UPGRADE_FIELD_NUMBER: builtins.int
    UPGRADE_MESSAGE_FIELD_NUMBER: builtins.int
    current_version: builtins.str
    latest_version: builtins.str
    should_upgrade: builtins.bool
    upgrade_message: builtins.str
    def __init__(
        self,
        *,
        current_version: builtins.str = ...,
        latest_version: builtins.str = ...,
        should_upgrade: builtins.bool = ...,
        upgrade_message: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["current_version", b"current_version", "latest_version", b"latest_version", "should_upgrade", b"should_upgrade", "upgrade_message", b"upgrade_message"]) -> None: ...

global___GetVersionInfoResponse = GetVersionInfoResponse

@typing_extensions.final
class InviteUsersRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    EMAILS_FIELD_NUMBER: builtins.int
    SIGNUP_DOMAIN_FIELD_NUMBER: builtins.int
    @property
    def emails(self) -> google.protobuf.internal.containers.RepeatedScalarFieldContainer[builtins.str]: ...
    signup_domain: builtins.str
    def __init__(
        self,
        *,
        emails: collections.abc.Iterable[builtins.str] | None = ...,
        signup_domain: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["emails", b"emails", "signup_domain", b"signup_domain"]) -> None: ...

global___InviteUsersRequest = InviteUsersRequest

@typing_extensions.final
class InviteUsersResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    MESSAGE_FIELD_NUMBER: builtins.int
    @property
    def message(self) -> protos.base_pb2.Message: ...
    def __init__(
        self,
        *,
        message: protos.base_pb2.Message | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["message", b"message"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["message", b"message"]) -> None: ...

global___InviteUsersResponse = InviteUsersResponse

@typing_extensions.final
class GetCurrentAccountUsersResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    META_FIELD_NUMBER: builtins.int
    USERS_FIELD_NUMBER: builtins.int
    @property
    def meta(self) -> protos.base_pb2.Meta: ...
    @property
    def users(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.accounts.account_pb2.User]: ...
    def __init__(
        self,
        *,
        meta: protos.base_pb2.Meta | None = ...,
        users: collections.abc.Iterable[protos.accounts.account_pb2.User] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["meta", b"meta"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["meta", b"meta", "users", b"users"]) -> None: ...

global___GetCurrentAccountUsersResponse = GetCurrentAccountUsersResponse

@typing_extensions.final
class ResetPasswordRequest(google.protobuf.message.Message):
    """///////////////////  Reset Password APIs  /////////////////////"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    EMAIL_FIELD_NUMBER: builtins.int
    email: builtins.str
    def __init__(
        self,
        *,
        email: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["email", b"email"]) -> None: ...

global___ResetPasswordRequest = ResetPasswordRequest

@typing_extensions.final
class ResetPasswordResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    SUCCESS_FIELD_NUMBER: builtins.int
    MESSAGE_FIELD_NUMBER: builtins.int
    success: builtins.bool
    @property
    def message(self) -> protos.base_pb2.Message: ...
    def __init__(
        self,
        *,
        success: builtins.bool = ...,
        message: protos.base_pb2.Message | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["message", b"message"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["message", b"message", "success", b"success"]) -> None: ...

global___ResetPasswordResponse = ResetPasswordResponse

@typing_extensions.final
class ResetPasswordConfirmRequest(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    TOKEN_FIELD_NUMBER: builtins.int
    EMAIL_FIELD_NUMBER: builtins.int
    NEW_PASSWORD_FIELD_NUMBER: builtins.int
    token: builtins.str
    email: builtins.str
    new_password: builtins.str
    def __init__(
        self,
        *,
        token: builtins.str = ...,
        email: builtins.str = ...,
        new_password: builtins.str = ...,
    ) -> None: ...
    def ClearField(self, field_name: typing_extensions.Literal["email", b"email", "new_password", b"new_password", "token", b"token"]) -> None: ...

global___ResetPasswordConfirmRequest = ResetPasswordConfirmRequest

@typing_extensions.final
class ResetPasswordConfirmResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    SUCCESS_FIELD_NUMBER: builtins.int
    MESSAGE_FIELD_NUMBER: builtins.int
    success: builtins.bool
    @property
    def message(self) -> protos.base_pb2.Message: ...
    def __init__(
        self,
        *,
        success: builtins.bool = ...,
        message: protos.base_pb2.Message | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["message", b"message"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["message", b"message", "success", b"success"]) -> None: ...

global___ResetPasswordConfirmResponse = ResetPasswordConfirmResponse

@typing_extensions.final
class OktaAuthData(google.protobuf.message.Message):
    """///// Okta Auth APIs //////"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    PK_FIELD_NUMBER: builtins.int
    EMAIL_FIELD_NUMBER: builtins.int
    FIRST_NAME_FIELD_NUMBER: builtins.int
    LAST_NAME_FIELD_NUMBER: builtins.int
    IS_NEW_USER_FIELD_NUMBER: builtins.int
    @property
    def pk(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    @property
    def email(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def first_name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def last_name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def is_new_user(self) -> google.protobuf.wrappers_pb2.BoolValue: ...
    def __init__(
        self,
        *,
        pk: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        email: google.protobuf.wrappers_pb2.StringValue | None = ...,
        first_name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        last_name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        is_new_user: google.protobuf.wrappers_pb2.BoolValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["email", b"email", "first_name", b"first_name", "is_new_user", b"is_new_user", "last_name", b"last_name", "pk", b"pk"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["email", b"email", "first_name", b"first_name", "is_new_user", b"is_new_user", "last_name", b"last_name", "pk", b"pk"]) -> None: ...

global___OktaAuthData = OktaAuthData

@typing_extensions.final
class OktaAuthResponse(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ACCESS_TOKEN_FIELD_NUMBER: builtins.int
    REFRESH_TOKEN_FIELD_NUMBER: builtins.int
    USER_FIELD_NUMBER: builtins.int
    @property
    def access_token(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def refresh_token(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def user(self) -> global___OktaAuthData: ...
    def __init__(
        self,
        *,
        access_token: google.protobuf.wrappers_pb2.StringValue | None = ...,
        refresh_token: google.protobuf.wrappers_pb2.StringValue | None = ...,
        user: global___OktaAuthData | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["access_token", b"access_token", "refresh_token", b"refresh_token", "user", b"user"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["access_token", b"access_token", "refresh_token", b"refresh_token", "user", b"user"]) -> None: ...

global___OktaAuthResponse = OktaAuthResponse
