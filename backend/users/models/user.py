"""
User models for VoteFight application.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

from utils.models import BaseModel, TimestampedModel
from .choices import UserRoleChoices, NotificationTypeChoices


class User(AbstractUser):
    """
    Extended User model with VoteFight-specific fields.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(
        max_length=30,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores.'
            )
        ]
    )
    role = models.CharField(
        max_length=20,
        choices=UserRoleChoices.choices,
        default=UserRoleChoices.USER
    )
    is_verified = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now)
    
    # User preferences
    language = models.CharField(max_length=5, default='uz')
    timezone = models.CharField(max_length=50, default='Asia/Tashkent')
    notifications_enabled = models.BooleanField(default=True)
    
    # Gamification
    points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    streak_days = models.PositiveIntegerField(default=0)
    last_streak_date = models.DateField(null=True, blank=True)
    
    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"@{self.username}"
    
    def get_full_name(self):
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def get_avatar_url(self):
        """Get user's avatar URL."""
        if hasattr(self, 'profile') and self.profile.avatar:
            return self.profile.avatar.url
        return None
    
    def update_last_active(self):
        """Update user's last active timestamp."""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])
    
    def add_points(self, points: int):
        """Add points to user and update level."""
        self.points += points
        self.level = self.calculate_level()
        self.save(update_fields=['points', 'level'])
    
    def calculate_level(self):
        """Calculate user level based on points."""
        # Simple level calculation: 100 points per level
        return max(1, (self.points // 100) + 1)
    
    def update_streak(self):
        """Update user's daily streak."""
        today = timezone.now().date()
        
        if self.last_streak_date:
            if (today - self.last_streak_date).days == 1:
                # Consecutive day
                self.streak_days += 1
            elif (today - self.last_streak_date).days > 1:
                # Streak broken
                self.streak_days = 1
        else:
            # First streak
            self.streak_days = 1
        
        self.last_streak_date = today
        self.save(update_fields=['streak_days', 'last_streak_date'])


class UserProfile(TimestampedModel):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True
    )
    cover_image = models.ImageField(
        upload_to='covers/',
        null=True,
        blank=True
    )
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Social links
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    tiktok_url = models.URLField(blank=True)
    
    # Privacy settings
    is_public = models.BooleanField(default=True)
    show_email = models.BooleanField(default=False)
    show_birth_date = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'users_profile'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def get_avatar_url(self):
        """Get avatar URL or default."""
        if self.avatar:
            return self.avatar.url
        return None
    
    def get_cover_url(self):
        """Get cover image URL or default."""
        if self.cover_image:
            return self.cover_image.url
        return None


class UserFollow(TimestampedModel):
    """
    User follow relationships.
    """
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following'
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers'
    )
    
    class Meta:
        db_table = 'users_follow'
        unique_together = ['follower', 'following']
        verbose_name = 'User Follow'
        verbose_name_plural = 'User Follows'
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
    
    def clean(self):
        """Validate follow relationship."""
        super().clean()
        if self.follower == self.following:
            raise ValidationError("Users cannot follow themselves.")


class UserNotification(TimestampedModel):
    """
    User notifications system.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationTypeChoices.choices
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Related objects (optional)
    battle = models.ForeignKey(
        'battles.Battle',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )
    
    class Meta:
        db_table = 'users_notification'
        verbose_name = 'User Notification'
        verbose_name_plural = 'User Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
