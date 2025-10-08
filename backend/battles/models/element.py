"""
Element model for VoteFight battles.
"""
from django.db import models
from django.core.exceptions import ValidationError

from utils.models import BaseModel
from .choices import MediaTypeChoices


class Element(BaseModel):
    """
    Battle element model representing options in a battle.
    """
    battle = models.ForeignKey(
        'battles.Battle',
        on_delete=models.CASCADE,
        related_name='elements'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True)
    
    # Media content
    media_type = models.CharField(
        max_length=20,
        choices=MediaTypeChoices.choices,
        blank=True
    )
    media_url = models.URLField(blank=True)
    media_file = models.FileField(
        upload_to='battle_media/',
        null=True,
        blank=True
    )
    
    # Media metadata
    file_size = models.PositiveIntegerField(null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)  # in seconds
    dimensions = models.CharField(max_length=20, blank=True)  # e.g., "1920x1080"
    
    # Vote tracking
    vote_count = models.PositiveIntegerField(default=0)
    vote_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0
    )
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'battles_element'
        verbose_name = 'Battle Element'
        verbose_name_plural = 'Battle Elements'
        ordering = ['order', 'created_at']
        unique_together = ['battle', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.battle.title})"
    
    def clean(self):
        """Validate element data."""
        super().clean()
        
        # Validate name
        if len(self.name.strip()) < 1:
            raise ValidationError("Element name cannot be empty.")
        
        # Validate media
        if self.media_type and not self.media_url and not self.media_file:
            raise ValidationError("Media URL or file is required when media type is specified.")
    
    def save(self, *args, **kwargs):
        """Override save to update vote statistics."""
        super().save(*args, **kwargs)
        self.update_vote_statistics()
    
    def update_vote_statistics(self):
        """Update vote count and percentage."""
        self.vote_count = self.votes.count()
        
        # Calculate percentage
        total_votes = self.battle.total_votes
        if total_votes > 0:
            self.vote_percentage = (self.vote_count / total_votes) * 100
        else:
            self.vote_percentage = 0.0
        
        self.save(update_fields=['vote_count', 'vote_percentage'])
    
    def get_media_url(self):
        """Get media URL for display."""
        if self.media_url:
            return self.media_url
        elif self.media_file:
            return self.media_file.url
        return None
    
    def get_thumbnail_url(self):
        """Get thumbnail URL for media preview."""
        if self.media_type == MediaTypeChoices.IMAGE:
            return self.get_media_url()
        elif self.media_type == MediaTypeChoices.VIDEO:
            # Return video thumbnail or first frame
            return self.get_media_url()
        return None
