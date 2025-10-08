"""
Battle model choices and enums.
"""
from django.db import models


class BattleStatusChoices(models.TextChoices):
    """Battle status choices."""
    ACTIVE = 'active', 'Active'
    EXPIRED = 'expired', 'Expired'
    DRAFT = 'draft', 'Draft'
    ARCHIVED = 'archived', 'Archived'


class CategoryChoices(models.TextChoices):
    """Battle category choices."""
    TECHNOLOGY = 'technology', 'Technology'
    SPORTS = 'sports', 'Sports'
    ENTERTAINMENT = 'entertainment', 'Entertainment'
    FOOD = 'food', 'Food'
    TRAVEL = 'travel', 'Travel'
    FASHION = 'fashion', 'Fashion'
    MUSIC = 'music', 'Music'
    GAMING = 'gaming', 'Gaming'
    POLITICS = 'politics', 'Politics'
    OTHER = 'other', 'Other'


class MediaTypeChoices(models.TextChoices):
    """Media type choices."""
    IMAGE = 'image', 'Image'
    VIDEO = 'video', 'Video'
    AUDIO = 'audio', 'Audio'
    DOCUMENT = 'document', 'Document'
