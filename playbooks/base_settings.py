"""
Django settings for playbooks project.

Generated by 'django-admin startproject' using Django 4.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

import os
from datetime import timedelta
from pathlib import Path

from environs import Env

env = Env()
env.read_env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str("DJANGO_SECRET_KEY", default='django-insecure-0=(%5(mscw_h4ah@i^n591qkor_(t+2d&+&j)4l8+4zpk65y%=')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DJANGO_DEBUG", default=True)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760

ALLOWED_HOSTS = ['*']

# Application definition

LOCAL_APPS = [
    'accounts.apps.AccountsConfig',
    'playbooks.apps.PlaybooksConfig',
    'connectors.apps.ConnectorsConfig',
    'connectors.assets.apps.AssetsManagerConfig',
    'management.apps.ManagementConfig',
    'executor.apps.ExecutorConfig',
    'executor.workflows.apps.WorkflowsConfig',
    'media.apps.MediaConfig',
    'intelligence_layer.apps.IntelligenceLayerConfig',
    'connectors.handlers.apps.HandlersConfig',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'corsheaders',
    "djcelery_email"
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_prometheus',
    'django_celery_beat',
    'django.contrib.sites',
    'django.contrib.postgres',
    *LOCAL_APPS,
    *THIRD_PARTY_APPS,
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'playbooks.middleware.RequestThreadLocalMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

ROOT_URLCONF = 'playbooks.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'playbooks.wsgi.application'

_default_postgres_host = env.str('POSTGRES_HOST', default='127.0.0.1')

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env.str('POSTGRES_DB', default='db'),
        'USER': env.str('POSTGRES_USER', default='user'),
        'PASSWORD': env.str('POSTGRES_PASSWORD', default='pass'),
        'HOST': _default_postgres_host,
        'PORT': env.str('POSTGRES_PORT', default='5432'),
    },
    'replica1': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env.str('POSTGRES_DB', default='db'),
        'USER': env.str('POSTGRES_USER', default='user'),
        'PASSWORD': env.str('POSTGRES_PASSWORD', default='pass'),
        'HOST': _default_postgres_host,
        'PORT': env.str('POSTGRES_PORT', default='5432'),
    },
    # 'clickhouse': {
    #     'ENGINE': 'clickhouse_backend.backend',
    #     'HOST': env.str("CLICKHOUSE_HOST", default='localhost'),
    #     'PORT': 9440,
    #     'USER': env.str("CLICKHOUSE_USERNAME", default='default'),
    #     'PASSWORD': env.str("CLICKHOUSE_PASSWORD", default=''),
    #     'OPTIONS': {
    #         'secure': True,
    #         'settings': {
    #             'allow_experimental_object_type': 1
    #         }
    #     }
    # }
}

DATABASE_ROUTERS = ['playbooks.db.router.DbRouter']

# Celery Configuration Options
CELERY_BROKER_URL = env.str('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env.str('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIME_ZONE = 'UTC'

# Celery Beat Configuration Options
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Redis Configuration
REDIS_URL = env.str('REDIS_URL', default='redis://localhost:6379')

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = "accounts.User"

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static")

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        # 'django.db.backends': {
        #     'level': 'DEBUG',
        #     'handlers': ['console'],
        # },
    },
}

CSRF_COOKIE_SECURE = False
CSRF_TRUSTED_ORIGINS = ['http://*', 'https://*']

REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # We have disabled csrf checks here.
        'playbooks.auth.CsrfExemptedSessionAuthentication',
    ),
}

SITE_ID = 1

ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'optional'  # set to 'mandatory' to require email verification
ACCOUNT_EMAIL_VERIFICATION_URL = '/confirm-email/{}/'
ACCOUNT_USER_DISPLAY = 'accounts.authentication.user_display'
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'http'
ACCOUNT_ADAPTER = 'accounts.authentication.AccountAdapter'

REST_SESSION_LOGIN = True
REST_USE_JWT = True
REST_AUTH_SERIALIZERS = {
    'LOGIN_SERIALIZER': 'accounts.serializer.AccountLoginSerializer'
}
REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'accounts.serializer.AccountRegisterSerializer',
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=6),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
JWT_AUTH_REFRESH_COOKIE = 'jwt-refresh'

RESTRICT_EMAIL_DOMAIN = env.str("RESTRICT_EMAIL_DOMAIN", default='')

# For demo purposes only. Use a white list in the real world.
CORS_ORIGIN_ALLOW_ALL = True

LOGIN_URL = '/accounts/login/'

# Email settings
EMAIL_USE_SITES = False
EMAIL_BACKEND = 'djcelery_email.backends.CeleryEmailBackend'
CELERY_EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
CELERY_EMAIL_TASK_CONFIG = {
    'queue': 'notification',
    'rate_limit': '50/m',
}


def get_cache_backend(alias='default'):
    if env.str("CACHE_BACKEND", default='locmem') == 'redis':
        return {
            alias: {
                "BACKEND": "django_redis.cache.RedisCache",
                "LOCATION": env.str("REDIS_URL", default='redis://localhost:6379/1'),
                "OPTIONS": {
                    "CLIENT_CLASS": "django_redis.client.DefaultClient",
                }
            }
        }
    else:
        return {
            alias: {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            }
        }


CACHES = {
    **get_cache_backend('default'),
}

# Accounts Module Cache Settings
GLOBAL_ACCOUNT_API_TOKEN_CACHE = {
    'cache_key': env.str("ACCOUNT_API_TOKEN_CACHE_KEY", default='default'),
    'enabled': env.bool("ACCOUNT_API_TOKEN_CACHE_ENABLED", default=True),
}

GLOBAL_ACCOUNT_CACHE = {
    'cache_key': env.str("ACCOUNT_CACHE_KEY", default='default'),
    'enabled': env.bool("ACCOUNT_CACHE_ENABLED", default=True),
}

GLOBAL_ACCOUNT_PASSWORD_CONTEXT_CACHE = {
    'cache_key': env.str("ACCOUNT_PASSWORD_CONTEXT_CACHE_KEY", default='default'),
    'enabled': env.bool("GLOBAL_ACCOUNT_PASSWORD_CONTEXT_CACHE", default=True),
}

WORKFLOW_SCHEDULER_INTERVAL = env.int("WORKFLOW_SCHEDULER_INTERVAL", default=10)

SITE_DEFAULT_HTTP_PROTOCOL = env.str("SITE_DEFAULT_HTTP_PROTOCOL", default='http')

RESET_PASSWORD_LOCATION = env.str("RESET_PASSWORD_PAGE_URL", default='/reset-password-confirm/?reset_token={}&email={}')
RESET_PASSWORD_SITE_HTTP_PROTOCOL = env.str("RESET_PASSWORD_SITE_HTTP_PROTOCOL", default='http')
RESET_PASSWORD_USE_SITE = env.bool("RESET_PASSWORD_USE_SITE", default=True)

MEDIA_ASSETS_ROOT = os.path.join(BASE_DIR, 'media/assets')
MEDIA_STORAGE_LOCATION = env.str("MEDIA_STORAGE_LOCATION", default='/media/images')
MEDIA_STORAGE_SITE_HTTP_PROTOCOL = env.str("MEDIA_STORAGE_SITE_HTTP_PROTOCOL", default='https')
MEDIA_STORAGE_USE_SITE = env.bool("MEDIA_STORAGE_USE_SITE", default=True)

PLAYBOOK_TEMPLATE_PATH = "playbooks-templates/"

PLATFORM_PLAYBOOKS_PAGE_LOCATION = env.str("PLATFORM_PLAYBOOKS_PAGE_PATH", default='/playbooks/{}')
PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL = env.str("PLATFORM_PLAYBOOKS_PAGE_SITE_HTTP_PROTOCOL", default='https')
PLATFORM_PLAYBOOKS_PAGE_USE_SITE = env.bool("PLATFORM_PLAYBOOKS_PAGE_USE_SITE", default=True)

WORKFLOW_EXECUTE_API_PATH = env.str("WORKFLOW_EXECUTE_API_PATH", default='api/execute')
WORKFLOW_EXECUTIONS_GET_API_PATH = env.str("WORKFLOW_EXECUTIONS_GET_API_PATH",
                                           default='api/executions/get')  # Deprecated
WORKFLOW_EXECUTIONS_GET_API_PATH_V2 = env.str("WORKFLOW_EXECUTIONS_GET_API_PATH_V2", default='api/executions/get/v2')
WORKFLOW_EXECUTE_API_SITE_HTTP_PROTOCOL = env.str("WORKFLOW_EXECUTE_API_SITE_HTTP_PROTOCOL", default='https')
WORKFLOW_EXECUTE_API_USE_SITE = env.bool("WORKFLOW_EXECUTE_API_USE_SITE", default=True)

PLATFORM_PLAYBOOKS_EXECUTION_LOCATION = env.str("PLATFORM_PLAYBOOKS_EXECUTION_LOCATION", default='/playbooks/logs/{}')
