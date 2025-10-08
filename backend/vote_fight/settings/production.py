"""
Production settings for VoteFight Django project.
"""
from .base import *

# Security settings
DEBUG = False
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_env_variable('DJANGO_DATABASE_NAME'),
        'USER': get_env_variable('DJANGO_DATABASE_USER'),
        'PASSWORD': get_env_variable('DJANGO_DATABASE_PASSWORD'),
        'HOST': get_env_variable('DJANGO_DATABASE_HOST'),
        'PORT': get_env_variable('DJANGO_DATABASE_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Static files for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files for production (AWS S3)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = get_env_variable('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = get_env_variable('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = get_env_variable('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = get_env_variable('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'private'
AWS_S3_FILE_OVERWRITE = False
AWS_S3_VERIFY = True

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = get_env_variable('EMAIL_HOST')
EMAIL_PORT = int(get_env_variable('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = get_env_variable('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = get_env_variable('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = get_env_variable('DEFAULT_FROM_EMAIL', 'noreply@votefight.com')

# Cache settings for production
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': get_env_variable('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            }
        }
    }
}

# Celery settings for production
CELERY_BROKER_URL = get_env_variable('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = get_env_variable('CELERY_RESULT_BACKEND')
CELERY_TASK_ALWAYS_EAGER = False

# Logging for production
LOGGING['handlers']['file']['filename'] = '/var/log/votefight/django.log'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['vote_fight']['level'] = 'INFO'

# Production-specific settings
VOTEFIGHT_SETTINGS.update({
    'DEBUG_MODE': False,
    'ENABLE_DEBUG_TOOLBAR': False,
    'DISABLE_CSRF': False,
    'ENABLE_ANALYTICS': True,
    'ENABLE_MONITORING': True,
})
