"""
Base models for VoteFight application.
Following Django Styleguide patterns.
"""
import uuid
from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """
    Base model with common fields and methods.
    All models should inherit from this base model.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
    
    def clean(self):
        """Override clean method for validation."""
        super().clean()
        # Add common validation logic here
    
    def save(self, *args, **kwargs):
        """Override save method to call full_clean."""
        self.full_clean()
        super().save(*args, **kwargs)


class TimestampedModel(BaseModel):
    """
    Model with timestamp fields and soft delete capability.
    """
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the model instance."""
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_active', 'deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted model instance."""
        self.is_active = True
        self.deleted_at = None
        self.save(update_fields=['is_active', 'deleted_at'])


class UUIDModel(BaseModel):
    """
    Model with UUID primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True


class SlugModel(BaseModel):
    """
    Model with slug field for SEO-friendly URLs.
    """
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Auto-generate slug if not provided."""
        if not self.slug:
            self.slug = self.generate_slug()
        super().save(*args, **kwargs)
    
    def generate_slug(self):
        """Generate slug from title or name field."""
        # Override in child classes
        return "default-slug"
