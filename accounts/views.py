import uuid
from typing import Union

from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation, EmailAddress
from django.http import HttpResponse, HttpRequest, Http404
from django.views.decorators.csrf import csrf_exempt
from google.protobuf.wrappers_pb2 import BoolValue

from accounts.models import get_request_account, Account, AccountApiToken, User, get_request_user, UserInvitation
from accounts.tasks import send_reset_password_email, send_user_invite_email
from accounts.utils import is_request_user_email_verified
from accounts.cache import GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE

from protos.accounts.account_pb2 import User as UserProto

from protos.base_pb2 import Message
from protos.accounts.api_pb2 import GetAccountApiTokensRequest, GetAccountApiTokensResponse, \
    CreateAccountApiTokenRequest, CreateAccountApiTokenResponse, DeleteAccountApiTokenRequest, \
    DeleteAccountApiTokenResponse, GetUserRequest, GetUserResponse, \
    ResetPasswordRequest, ResetPasswordResponse, ResetPasswordConfirmRequest, ResetPasswordConfirmResponse, \
    GetCurrentAccountUsersResponse, InviteUsersResponse, InviteUsersRequest

from playbooks.threadlocal import get_current_request
from playbooks.utils.decorators import web_api, auth_web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page


@web_api(GetAccountApiTokensRequest)
def get_account_api_tokens(request_message: GetAccountApiTokensRequest) -> \
        Union[GetAccountApiTokensResponse, HttpResponse]:
    if not is_request_user_email_verified():
        return GetAccountApiTokensResponse(meta=get_meta(), account_api_tokens=[])

    account: Account = get_request_account()
    qs = account.account_api_token.all()

    total_count = qs.count()
    page = request_message.meta.page
    account_api_tokens = [account_api_token.proto for account_api_token in
                          filter_page(qs.order_by("-created_at"), page)]

    return GetAccountApiTokensResponse(
        meta=get_meta(page=page, total_count=total_count),
        account_api_tokens=account_api_tokens)


@web_api(CreateAccountApiTokenRequest)
def create_account_api_token(request_message: CreateAccountApiTokenRequest) -> \
        Union[CreateAccountApiTokenResponse, HttpResponse]:
    # if not is_request_user_email_verified():
    #     return CreateAccountApiTokenResponse(success=BoolValue(value=False))

    user = get_current_request().user
    account: Account = get_request_account()

    api_token = AccountApiToken(account=account, created_by=user)
    api_token.save()
    return CreateAccountApiTokenResponse(success=BoolValue(value=True), account_api_token=api_token.proto)


@web_api(DeleteAccountApiTokenRequest)
def delete_account_api_token(request_message: DeleteAccountApiTokenRequest) -> Union[
    DeleteAccountApiTokenResponse, HttpResponse]:
    if not is_request_user_email_verified():
        return DeleteAccountApiTokenResponse(success=BoolValue(value=False))

    account: Account = get_request_account()
    key: str = request_message.account_api_token_key
    if key == "":
        return DeleteAccountApiTokenResponse(success=BoolValue(value=False))
    try:
        api_token = AccountApiToken.objects.get(key=key, account=account)
    except AccountApiToken.DoesNotExist:
        return DeleteAccountApiTokenResponse(success=BoolValue(value=False))

    api_token.delete()
    return DeleteAccountApiTokenResponse(success=BoolValue(value=True))


@csrf_exempt
def confirm_email_link(request: HttpRequest, key):
    email_confirmation = EmailConfirmationHMAC.from_key(key)
    if not email_confirmation:
        queryset = EmailConfirmation.objects.all_valid()
        queryset = queryset.select_related("email_address__user")
        try:
            email_confirmation = queryset.get(key=key.lower())
        except EmailConfirmation.DoesNotExist:
            raise Http404()
    email_confirmation.confirm(request)
    return HttpResponse({'success': True})


@web_api(GetUserRequest)
def get_user(request_message: GetUserRequest) -> Union[GetUserResponse, HttpResponse]:
    request = get_current_request()
    user = request.user
    return GetUserResponse(user=user.proto)


@auth_web_api(ResetPasswordRequest)
def reset_password(request_message: ResetPasswordRequest) -> Union[ResetPasswordResponse, HttpResponse]:
    email = request_message.email
    send_reset_password_email(email)
    return ResetPasswordResponse(success=True,
                                 message=Message(title='Reset password email sent. Please check your email.'))


@auth_web_api(ResetPasswordConfirmRequest)
def reset_password_confirm(request_message: ResetPasswordConfirmRequest) -> \
        Union[ResetPasswordConfirmResponse, HttpResponse]:
    token = request_message.token
    email = request_message.email
    new_password = request_message.new_password

    cache_token = GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE.get(email)
    if cache_token != token:
        return ResetPasswordConfirmResponse(success=False, message=Message(title='Invalid token.'))

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return ResetPasswordConfirmResponse(success=False, message=Message(title='User does not exist.'))

    user.set_password(new_password)
    user.save()
    return ResetPasswordConfirmResponse(success=True, message=Message(
        title='Password reset successfully. Please login with the new password.'))


@web_api(GetAccountApiTokensRequest)
def get_current_users(request_message: GetAccountApiTokensRequest) -> \
        Union[GetCurrentAccountUsersResponse, HttpResponse]:
    account: Account = get_request_account()
    current_account_users = User.objects.filter(account=account, is_active=True, is_staff=False)

    current_account_user_protos = []
    for u in current_account_users:
        current_account_user_protos.append(
            UserProto(id=u.id, email=u.email, first_name=u.first_name, last_name=u.last_name))

    return GetCurrentAccountUsersResponse(users=current_account_user_protos)


@web_api(InviteUsersRequest)
def invite_users(request_message: InviteUsersRequest) -> Union[InviteUsersResponse, HttpResponse]:
    user: User = get_request_user()
    emails = request_message.emails
    signup_domain = request_message.signup_domain

    for em in emails:
        UserInvitation.objects.create(account=user.account, invitee_user=user,
                                      email=em, invite_token=uuid.uuid4().hex)
        send_user_invite_email(user.full_name, em, signup_domain)

    return InviteUsersResponse(message=Message(title='Invitation sent successfully.'))
