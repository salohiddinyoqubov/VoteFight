"""
Development settings for VoteFight Django project.
"""
from .base import *

# Debug settings
DEBUG = True

# Development-specific apps
INSTALLED_APPS += [
    'django_extensions',
    'debug_toolbar',
]

# Development middleware
MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Database for development (SQLite for simplicity)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Debug Toolbar settings
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache settings for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Celery settings for development
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Logging for development
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['vote_fight']['level'] = 'DEBUG'

# Development-specific settings
VOTEFIGHT_SETTINGS.update({
    'DEBUG_MODE': True,
    'ENABLE_DEBUG_TOOLBAR': True,
    'DISABLE_CSRF': False,  # Keep CSRF enabled even in development
})
