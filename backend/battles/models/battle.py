"""
Battle models for VoteFight application.
"""
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from utils.models import BaseModel, TimestampedModel
from .choices import BattleStatusChoices, CategoryChoices

User = get_user_model()


class Battle(TimestampedModel):
    """
    Main battle model representing a voting competition.
    """
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='battles'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=1000, blank=True)
    category = models.CharField(
        max_length=20,
        choices=CategoryChoices.choices,
        default=CategoryChoices.OTHER
    )
    status = models.CharField(
        max_length=20,
        choices=BattleStatusChoices.choices,
        default=BattleStatusChoices.ACTIVE
    )
    
    # Timing
    deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Engagement metrics
    views = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    total_votes = models.PositiveIntegerField(default=0)
    
    # Trending algorithm
    trending_score = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        default=0.0
    )
    vote_velocity = models.PositiveIntegerField(default=0)  # Votes per hour
    engagement_score = models.PositiveIntegerField(default=0)
    
    # SEO and sharing
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    thumbnail_url = models.URLField(blank=True)
    
    # Privacy and moderation
    is_public = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_moderated = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'battles_battle'
        verbose_name = 'Battle'
        verbose_name_plural = 'Battles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['trending_score']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def clean(self):
        """Validate battle data."""
        super().clean()
        
        # Validate deadline
        if self.deadline and self.deadline <= timezone.now():
            raise ValidationError("Deadline must be in the future.")
        
        # Validate title
        if len(self.title.strip()) < 3:
            raise ValidationError("Title must be at least 3 characters long.")
    
    def save(self, *args, **kwargs):
        """Override save to handle slug generation and status updates."""
        if not self.slug:
            self.slug = self.generate_slug()
        
        # Update status based on deadline
        if self.deadline and self.deadline <= timezone.now():
            self.status = BattleStatusChoices.EXPIRED
            self.is_active = False
        
        super().save(*args, **kwargs)
    
    def generate_slug(self):
        """Generate SEO-friendly slug."""
        from django.utils.text import slugify
        base_slug = slugify(self.title)
        slug = base_slug
        
        counter = 1
        while Battle.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def get_absolute_url(self):
        """Get battle's absolute URL."""
        return f"/battles/{self.id}/"
    
    def get_thumbnail_url(self):
        """Get battle thumbnail URL."""
        if self.thumbnail_url:
            return self.thumbnail_url
        
        # Try to get thumbnail from first element
        first_element = self.elements.first()
        if first_element and first_element.media_url:
            return first_element.media_url
        
        return None
    
    def update_metrics(self):
        """Update battle engagement metrics."""
        self.likes_count = self.likes.count()
        self.shares_count = self.shares.count()
        self.comments_count = self.comments.count()
        self.total_votes = self.votes.count()
        self.save(update_fields=[
            'likes_count', 'shares_count', 'comments_count', 'total_votes'
        ])
    
    def calculate_trending_score(self):
        """Calculate trending score based on multiple factors."""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        hours_since_creation = (now - self.created_at).total_seconds() / 3600
        
        # Vote velocity (votes per hour)
        recent_votes = self.votes.filter(
            created_at__gte=now - timedelta(hours=1)
        ).count()
        self.vote_velocity = recent_votes
        
        # Engagement score
        self.engagement_score = (
            self.likes_count * 2 +
            self.shares_count * 3 +
            self.comments_count * 1
        )
        
        # Time decay factor (newer battles get higher scores)
        time_decay = max(0.1, 1 - (hours_since_creation / 168))  # 1 week decay
        
        # Calculate trending score
        self.trending_score = (
            self.vote_velocity * 0.4 +
            self.engagement_score * 0.3 +
            self.total_votes * 0.2 +
            time_decay * 0.1
        )
        
        self.save(update_fields=[
            'trending_score', 'vote_velocity', 'engagement_score'
        ])
    
    def increment_views(self):
        """Increment view count."""
        self.views += 1
        self.save(update_fields=['views'])


class BattleLike(TimestampedModel):
    """
    Battle likes model.
    """
    battle = models.ForeignKey(
        Battle,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='battle_likes'
    )
    
    class Meta:
        db_table = 'battles_like'
        unique_together = ['battle', 'user']
        verbose_name = 'Battle Like'
        verbose_name_plural = 'Battle Likes'
    
    def __str__(self):
        return f"{self.user.username} likes {self.battle.title}"


class BattleShare(TimestampedModel):
    """
    Battle shares model.
    """
    battle = models.ForeignKey(
        Battle,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='battle_shares'
    )
    platform = models.CharField(max_length=20, default='internal')  # internal, twitter, facebook, etc.
    
    class Meta:
        db_table = 'battles_share'
        verbose_name = 'Battle Share'
        verbose_name_plural = 'Battle Shares'
    
    def __str__(self):
        return f"{self.user.username} shared {self.battle.title}"


class BattleComment(TimestampedModel):
    """
    Battle comments model.
    """
    battle = models.ForeignKey(
        Battle,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='battle_comments'
    )
    content = models.TextField(max_length=500)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    likes_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'battles_comment'
        verbose_name = 'Battle Comment'
        verbose_name_plural = 'Battle Comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} commented on {self.battle.title}"
    
    def clean(self):
        """Validate comment content."""
        super().clean()
        if len(self.content.strip()) < 1:
            raise ValidationError("Comment cannot be empty.")
