from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer
from rest_framework import serializers


class AccountLoginSerializer(LoginSerializer):
    username = None
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'})


class AccountRegisterSerializer(RegisterSerializer):
    username = None
    password1 = None
    password2 = None

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def validate_password(self, password):
        return self.validate_password1(password)

    def validate(self, data):
        return data

    def custom_signup(self, request, user):
        pass

    def get_cleaned_data(self):
        return {
            'password1': self.validated_data.get('password', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }
