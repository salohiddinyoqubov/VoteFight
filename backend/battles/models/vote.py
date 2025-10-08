"""
Vote model for VoteFight battles.
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from utils.models import BaseModel

User = get_user_model()


class Vote(BaseModel):
    """
    Vote model for battle elements.
    Implements fraud prevention through multiple tracking methods.
    """
    battle = models.ForeignKey(
        'battles.Battle',
        on_delete=models.CASCADE,
        related_name='votes'
    )
    element = models.ForeignKey(
        'battles.Element',
        on_delete=models.CASCADE,
        related_name='votes'
    )
    
    # User information (optional for anonymous voting)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='votes'
    )
    
    # Fraud prevention tracking
    voter_ip = models.GenericIPAddressField()
    fingerprint = models.CharField(max_length=255)  # Browser fingerprint
    user_agent = models.TextField(blank=True)
    session_key = models.CharField(max_length=40, blank=True)
    
    # Vote metadata
    vote_weight = models.PositiveIntegerField(default=1)  # For future weighted voting
    is_verified = models.BooleanField(default=True)
    verification_method = models.CharField(
        max_length=20,
        default='standard',
        choices=[
            ('standard', 'Standard'),
            ('captcha', 'CAPTCHA'),
            ('email', 'Email Verification'),
            ('phone', 'Phone Verification'),
        ]
    )
    
    class Meta:
        db_table = 'battles_vote'
        verbose_name = 'Vote'
        verbose_name_plural = 'Votes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['battle', 'voter_ip']),
            models.Index(fields=['battle', 'fingerprint']),
            models.Index(fields=['battle', 'session_key']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        user_info = self.user.username if self.user else f"Anonymous ({self.voter_ip})"
        return f"{user_info} voted for {self.element.name} in {self.battle.title}"
    
    def clean(self):
        """Validate vote data."""
        super().clean()
        
        # Ensure element belongs to the battle
        if self.element.battle != self.battle:
            raise ValidationError("Element must belong to the specified battle.")
        
        # Validate fraud prevention fields
        if not self.voter_ip:
            raise ValidationError("Voter IP is required.")
        
        if not self.fingerprint:
            raise ValidationError("Fingerprint is required.")
    
    def save(self, *args, **kwargs):
        """Override save to update battle and element statistics."""
        super().save(*args, **kwargs)
        self.update_statistics()
    
    def update_statistics(self):
        """Update battle and element vote statistics."""
        # Update element vote count
        self.element.update_vote_statistics()
        
        # Update battle total votes
        self.battle.total_votes = self.battle.votes.count()
        self.battle.save(update_fields=['total_votes'])
    
    @classmethod
    def has_user_voted(cls, battle, voter_ip=None, fingerprint=None, user=None):
        """
        Check if user has already voted in a battle.
        Supports multiple fraud prevention methods.
        """
        if user and user.is_authenticated:
            # Authenticated user check
            return cls.objects.filter(
                battle=battle,
                user=user
            ).exists()
        
        # Anonymous user check
        if voter_ip and fingerprint:
            return cls.objects.filter(
                battle=battle,
                voter_ip=voter_ip,
                fingerprint=fingerprint
            ).exists()
        
        return False
    
    @classmethod
    def get_vote_cooldown_remaining(cls, voter_ip, fingerprint):
        """
        Check if user is in cooldown period.
        Returns remaining cooldown time in seconds.
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Check for recent votes (1 minute cooldown)
        cooldown_period = timedelta(minutes=1)
        recent_vote = cls.objects.filter(
            voter_ip=voter_ip,
            fingerprint=fingerprint,
            created_at__gte=timezone.now() - cooldown_period
        ).first()
        
        if recent_vote:
            remaining_time = (
                recent_vote.created_at + cooldown_period - timezone.now()
            ).total_seconds()
            return max(0, remaining_time)
        
        return 0
    
    @classmethod
    def get_vote_rate_limit_status(cls, voter_ip, fingerprint):
        """
        Check if user has exceeded rate limits.
        Returns (is_limited, remaining_votes, reset_time).
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Rate limit: 10 votes per 5 minutes
        rate_limit_window = timedelta(minutes=5)
        max_votes_per_window = 10
        
        recent_votes = cls.objects.filter(
            voter_ip=voter_ip,
            fingerprint=fingerprint,
            created_at__gte=timezone.now() - rate_limit_window
        ).count()
        
        is_limited = recent_votes >= max_votes_per_window
        remaining_votes = max(0, max_votes_per_window - recent_votes)
        
        # Calculate reset time
        oldest_recent_vote = cls.objects.filter(
            voter_ip=voter_ip,
            fingerprint=fingerprint,
            created_at__gte=timezone.now() - rate_limit_window
        ).order_by('created_at').first()
        
        reset_time = None
        if oldest_recent_vote:
            reset_time = oldest_recent_vote.created_at + rate_limit_window
        
        return is_limited, remaining_votes, reset_time
