from dj_rest_auth.registration.views import VerifyEmailView, ResendEmailVerificationView, RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from django.conf import settings
from django.urls import path, re_path
from django.views.generic import TemplateView

from accounts import views

accounturlpatterns = [
    path('login/', LoginView.as_view(), name='rest_login'),
    path('reset-user-password/', views.reset_password, name='rest_password'),
    path('reset-user-password-confirm/', views.reset_password_confirm, name='rest_password_confirm'),
    path('logout/', LogoutView.as_view(), name='rest_logout'),
    path('user/', views.get_user, name='rest_user_details'),
    path('signup/', RegisterView.as_view(), name='rest_signup'),
    path('verify-email/', VerifyEmailView.as_view(), name='rest_verify_email'),
    path('resend-email/', ResendEmailVerificationView.as_view(), name="rest_resend_email"),

    path('current_users', views.get_current_users, name='current_users'),
    path('invite_users', views.invite_users, name='invite_users'),

    path('login/okta', views.login_okta, name='login-redirect'),
    path('oauth/callback/okta', views.outh_callback_okta, name='login-callback'),

    path('version-info', views.version_info, name='version-info'),

    re_path(
        r'^confirm-email-link/(?P<key>[-:\w]+)/$', views.confirm_email_link,
        name='account_confirm_email',
    ),
    path(
        'account-email-verification-sent/', TemplateView.as_view(),
        name='account_email_verification_sent',
    ),
]

if getattr(settings, 'REST_USE_JWT', False):
    from rest_framework_simplejwt.views import TokenVerifyView

    from dj_rest_auth.jwt_auth import get_refresh_view

    accounturlpatterns += [
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        path('token/refresh/', get_refresh_view().as_view(), name='token_refresh'),
    ]

urlpatterns = [
    *accounturlpatterns,
    path('account_api_tokens', views.get_account_api_tokens),
    path('account_api_tokens/create', views.create_account_api_token),
    path('account_api_tokens/delete', views.delete_account_api_token),
]
