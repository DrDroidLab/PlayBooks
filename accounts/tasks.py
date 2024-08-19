import logging
import uuid

from celery import shared_task

from accounts.cache import GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE
from accounts.utils import generate_reset_password_hyperlink, generate_signup_hyperlink

from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task
def send_reset_password_email(email: str):
    try:
        token = uuid.uuid4().hex
        GLOBAL_ACCOUNT_FORGOT_PASSWORD_TOKEN_CACHE.create_or_update(email, token)
        msg_html = render_to_string('reset_password_message.html',
                                    {'custom_user_name': email,
                                     'reset_url': generate_reset_password_hyperlink(token, email)})
        recipient_email_id = email
        send_mail(
            subject="Doctor Droid - Reset Password",
            message="",
            from_email=None,
            recipient_list=[recipient_email_id],
            html_message=msg_html
        )
    except Exception as e:
        logger.error(str(e))
        pass


@shared_task
def send_user_invite_email(sender_name: str, invited_user_email: str, signup_domain: str):
    try:
        msg_html = render_to_string('invite_user_message.html',
                                    {'sender_name': sender_name, 'invited_user_email': invited_user_email,
                                     'signup_url': generate_signup_hyperlink(signup_domain)})
        recipient_email_id = invited_user_email
        send_mail(
            subject="Doctor Droid | You've been invited to join {}'s team".format(sender_name),
            message="",
            from_email=None,
            recipient_list=[recipient_email_id],
            html_message=msg_html
        )
    except Exception as e:
        logger.error(str(e))
        pass
