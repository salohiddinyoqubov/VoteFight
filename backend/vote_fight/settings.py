"""
Django settings for VoteFight project.
"""
import os

# Determine environment
ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')

if ENVIRONMENT == 'production':
    from .settings.production import *
else:
    from .settings.development import *