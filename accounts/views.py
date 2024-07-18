import uuid
from typing import Union

import docker
import requests
from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation, EmailAddress
from django.conf import settings
from django.http import HttpResponse, HttpRequest, Http404, JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from google.protobuf.wrappers_pb2 import BoolValue, StringValue, UInt64Value
from rest_framework.decorators import api_view

from accounts.models import get_request_account, Account, AccountApiToken, User, get_request_user, UserInvitation, \
    AccountUserOauth2SessionCodeStore
from accounts.signals import generate_account_token_on_email_confirmed
from accounts.tasks import send_reset_password_email, send_user_invite_email
from accounts.cache import GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE
from accounts.utils import create_random_password

from protos.accounts.account_pb2 import User as UserProto, SSOProvider

from protos.base_pb2 import Message
from protos.accounts.api_pb2 import GetAccountApiTokensRequest, GetAccountApiTokensResponse, \
    CreateAccountApiTokenRequest, CreateAccountApiTokenResponse, DeleteAccountApiTokenRequest, \
    DeleteAccountApiTokenResponse, GetUserRequest, GetUserResponse, GetVersionInfoResponse, \
    ResetPasswordRequest, ResetPasswordResponse, ResetPasswordConfirmRequest, ResetPasswordConfirmResponse, \
    GetCurrentAccountUsersResponse, InviteUsersResponse, InviteUsersRequest, OktaAuthResponse, \
    OktaAuthData

from playbooks.threadlocal import get_current_request
from playbooks.utils.decorators import api_blocked, web_api, auth_web_api
from playbooks.utils.meta import get_meta
from playbooks.utils.queryset import filter_page
from utils.cryptography_utils import generate_code_verifier, generate_code_challenge, generate_uuid_with_timestamp
from utils.proto_utils import proto_to_dict
from utils.uri_utils import build_absolute_uri


@api_blocked
@web_api(GetAccountApiTokensRequest)
def get_account_api_tokens(request_message: GetAccountApiTokensRequest) -> \
        Union[GetAccountApiTokensResponse, HttpResponse]:
    account: Account = get_request_account()
    qs = account.account_api_token.all()

    total_count = qs.count()
    page = request_message.meta.page
    account_api_tokens = [account_api_token.proto for account_api_token in
                          filter_page(qs.order_by("-created_at"), page)]

    return GetAccountApiTokensResponse(
        meta=get_meta(page=page, total_count=total_count),
        account_api_tokens=account_api_tokens)


@api_blocked
@web_api(CreateAccountApiTokenRequest)
def create_account_api_token(request_message: CreateAccountApiTokenRequest) -> \
        Union[CreateAccountApiTokenResponse, HttpResponse]:
    user = get_current_request().user
    account: Account = get_request_account()

    api_token = AccountApiToken(account=account, created_by=user)
    api_token.save()
    return CreateAccountApiTokenResponse(success=BoolValue(value=True), account_api_token=api_token.proto)


@api_blocked
@web_api(DeleteAccountApiTokenRequest)
def delete_account_api_token(request_message: DeleteAccountApiTokenRequest) -> \
        Union[DeleteAccountApiTokenResponse, HttpResponse]:
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


@api_blocked
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


@api_blocked
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


@csrf_exempt
@api_view(['GET'])
def get_login_providers(request_message: HttpRequest) -> JsonResponse:
    active_providers = []
    if settings.OKTA_CLIENT_ID and settings.OKTA_DOMAIN:
        active_providers.append(SSOProvider.Name(SSOProvider.OKTA))
    return JsonResponse({'active_providers': active_providers}, status=200)


@csrf_exempt
@api_view(['GET'])
def get_redirect_uri_okta(request_message: HttpRequest) -> JsonResponse:
    client_id = settings.OKTA_CLIENT_ID
    domain = settings.OKTA_DOMAIN
    if not domain.startswith('http') or not domain.startswith('https'):
        domain = f'https://{domain}'
    if domain.endswith('/'):
        domain = domain[:-1]
    enabled = settings.OKTA_CLIENT_USE_SITE
    protocol = settings.OKTA_CLIENT_SITE_HTTP_PROTOCOL
    location = settings.OKTA_CLIENT_REDIRECT_LOCATION
    if not domain or domain == '' or not client_id or client_id == '' or not location or location == '':
        return JsonResponse({'error': 'OKTA_DOMAIN, OKTA_CLIENT_ID, OKTA_CLIENT_REDIRECT_LOCATION are required.'},
                            status=400)
    try:
        okta_redirect_uri = build_absolute_uri(None, location, protocol, enabled)
    except Exception as e:
        return JsonResponse({'success': False, 'message': 'Okta Login failed'}, status=500)

    try:
        code_verifier = generate_code_verifier()
        code_challenge = generate_code_challenge(code_verifier)
        oauth_session = AccountUserOauth2SessionCodeStore.objects.create(code_verifier=code_verifier,
                                                                         code_challenge=code_challenge)
        oauth_session.save()
    except Exception as e:
        return JsonResponse({'success': False, 'message': 'Failed to create a valid session of Okta Oauth2 Login'},
                            status=500)

    session_id = oauth_session.session_id
    return JsonResponse({
        'success': True,
        'redirect_uri': f'{domain}/oauth2/v1/authorize?client_id={client_id}&response_type=code&response_mode=query&scope=openid profile email&redirect_uri={okta_redirect_uri}&state={session_id}&code_challenge={code_challenge}&code_challenge_method=S256'},
        status=200)


@csrf_exempt
@api_view(['GET'])
def login_okta(request_message: HttpRequest) -> JsonResponse:
    code = request_message.GET.get('code')
    session_id = request_message.GET.get('state')
    client_id = settings.OKTA_CLIENT_ID
    domain = settings.OKTA_DOMAIN
    if not domain.startswith('http') or not domain.startswith('https'):
        domain = f'https://{domain}'
    if domain.endswith('/'):
        domain = domain[:-1]
    enabled = settings.OKTA_CLIENT_USE_SITE
    protocol = settings.OKTA_CLIENT_SITE_HTTP_PROTOCOL
    location = settings.OKTA_CLIENT_REDIRECT_LOCATION
    if not domain or domain == '' or not client_id or client_id == '' or not location or location == '':
        return JsonResponse({'error': 'OKTA_DOMAIN, OKTA_CLIENT_ID, OKTA_CLIENT_REDIRECT_LOCATION are required.'},
                            status=500)
    try:
        okta_redirect_uri = build_absolute_uri(None, location, protocol, enabled)
    except Exception as e:
        return JsonResponse({'success': False, 'message': 'Okta Login failed'}, status=500)

    try:
        db_account_user_oauth2_session = AccountUserOauth2SessionCodeStore.objects.get(session_id=session_id)
    except AccountUserOauth2SessionCodeStore.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invalid session id'}, status=500)

    current_time = timezone.now()
    if current_time > db_account_user_oauth2_session.valid_until:
        return JsonResponse({'success': False, 'message': 'Session expired. Please try again.'}, status=500)

    url = f'{domain}/oauth2/v1/token'
    code_verifier = db_account_user_oauth2_session.code_verifier
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'code': code,
        'redirect_uri': okta_redirect_uri,
        'code_verifier': code_verifier
    }
    response = requests.post(url, data=token_data)

    if not response.ok:
        return JsonResponse({'success': False, 'message': 'Failed to get token from okta oauth server'}, status=500)

    response = requests.get(f'{domain}/oauth2/v1/userinfo', headers={'Accept': 'application/json',
                                                                             'Authorization': f'Bearer {response.json()["access_token"]}'})

    email = response.json()['email']
    first_name = response.json()['given_name']
    last_name = response.json()['family_name']
    is_new_user = False

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = None

    if user:
        if not user.is_active:
            print("Social Sign-in: User is not active - {}".format(user.id))
            return JsonResponse({'success': False, 'message': 'User is not active'}, status=403)
        user.last_login = timezone.now()
        user.save()
    else:
        user = User.objects.create_user(email=email, password=create_random_password(), first_name=first_name,
                                        last_name=last_name)
        user.is_social = True
        user.social_auth_provider = 'okta'
        user.last_login = timezone.now()
        user.save()
        is_new_user = True
        EmailAddress.objects.create(user=user, email=email, verified=True, primary=True)
        generate_account_token_on_email_confirmed(request_message, email)
        print("Social Sign-in: New user created - {}".format(user.id))

    from dj_rest_auth.utils import jwt_encode
    auth_token, refresh_token = jwt_encode(user)

    user_data = OktaAuthData(pk=UInt64Value(value=user.id),
                             email=StringValue(value=email),
                             first_name=StringValue(value=first_name),
                             last_name=StringValue(value=last_name),
                             is_new_user=BoolValue(value=is_new_user))

    response_proto = OktaAuthResponse(access_token=StringValue(value=str(auth_token)),
                                      refresh_token=StringValue(value=str(refresh_token)),
                                      user=user_data)
    return JsonResponse(proto_to_dict(response_proto), status=200)
