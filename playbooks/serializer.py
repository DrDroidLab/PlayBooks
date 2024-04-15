from dj_rest_auth.registration.serializers import RegisterSerializer
from django.conf import settings
from rest_framework import serializers


class DomainEmailRegisterSerializer(RegisterSerializer):
    username = None

    def validate_email(self, email):
        email: str = super().validate_email(email)
        if settings.RESTRICT_EMAIL_DOMAIN:
            if settings.RESTRICT_EMAIL_DOMAIN != email.split('@')[1]:
                raise serializers.ValidationError(
                    f'A email domain needs to be of format {settings.RESTRICT_EMAIL_DOMAIN}.',
                )

        return email
