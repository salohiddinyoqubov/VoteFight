"""
User model choices and enums.
"""
from django.db import models


class UserRoleChoices(models.TextChoices):
    """User role choices."""
    USER = 'user', 'User'
    MODERATOR = 'moderator', 'Moderator'
    ADMIN = 'admin', 'Admin'
    SUPER_ADMIN = 'super_admin', 'Super Admin'


class NotificationTypeChoices(models.TextChoices):
    """Notification type choices."""
    VOTE_RECEIVED = 'vote_received', 'Vote Received'
    BATTLE_TRENDING = 'battle_trending', 'Battle Trending'
    USER_FOLLOWED = 'user_followed', 'User Followed'
    BATTLE_EXPIRED = 'battle_expired', 'Battle Expired'
    BATTLE_LIKED = 'battle_liked', 'Battle Liked'
    BATTLE_SHARED = 'battle_shared', 'Battle Shared'
    COMMENT_RECEIVED = 'comment_received', 'Comment Received'
