from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
import jwt
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework.authentication import TokenAuthentication

from accounts.cache import GLOBAL_ACCOUNT_API_TOKEN_CACHE
from accounts.models import AccountApiToken, AccountApiTokenUser
from utils.uri_utils import build_absolute_uri


class AccountApiTokenAuthentication(TokenAuthentication):
    model = AccountApiToken
    keyword = 'Bearer'

    def authenticate_credentials(self, key):
        token = GLOBAL_ACCOUNT_API_TOKEN_CACHE.get(api_key=key)
        return AccountApiTokenUser(token.account_id), token


def user_display(user):
    return user.email


class AccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        location = settings.ACCOUNT_EMAIL_VERIFICATION_URL.format(emailconfirmation.key)
        protocol = settings.ACCOUNT_DEFAULT_HTTP_PROTOCOL
        enabled = settings.EMAIL_USE_SITES
        if enabled:
            uri = build_absolute_uri(None, location, protocol, enabled)
        else:
            uri = build_absolute_uri(request, location, protocol, enabled)
        return uri

    def render_mail(self, template_prefix, email, context, headers=None):
        if not template_prefix == "account/email/email_confirmation_signup" or \
                template_prefix == "account/email/email_confirmation":
            return super().render_mail(template_prefix, email, context, headers)

        to = [email] if isinstance(email, str) else email
        subject = render_to_string("email_confirmation_subject.txt", context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = self.format_email_subject(subject)

        from_email = self.get_from_email()

        context["custom_user_name"] = context["user"].first_name + " " + context["user"].last_name

        text_body = render_to_string(
            "email_confirmation_message.txt",
            context,
            self.request,
        ).strip()

        html_body = render_to_string(
            "email_confirmation_message.html",
            context,
            self.request,
        ).strip()

        msg = EmailMultiAlternatives(subject, text_body, from_email, to, headers=headers)
        msg.attach_alternative(html_body, "text/html")
        return msg


def create_jwt(user):
    from datetime import datetime, timedelta
    # Create the JWT payload
    payload = {
        'user_identifier': user.email,
        'exp': int((datetime.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']).timestamp()),
        # set the expiration time for 5 hour from now
        'iat': datetime.now().timestamp(),
        'username': user.email
    }

    # Encode the JWT with your secret key
    jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return jwt_token
