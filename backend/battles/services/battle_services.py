"""
Battle service functions for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import List, Dict, Any, Optional
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone

from ..models import Battle, Element, BattleLike, BattleShare, BattleComment
from ..models.choices import BattleStatusChoices, CategoryChoices

User = get_user_model()


def battle_create(
    *,
    user: User,
    title: str,
    description: str = "",
    category: str = CategoryChoices.OTHER,
    deadline: Optional[timezone.datetime] = None,
    elements: List[Dict[str, Any]],
    is_public: bool = True
) -> Battle:
    """
    Create a new battle with elements.
    
    Args:
        user: User creating the battle
        title: Battle title
        description: Battle description
        category: Battle category
        deadline: Optional deadline
        elements: List of element data
        is_public: Whether battle is public
    
    Returns:
        Created Battle instance
        
    Raises:
        ValidationError: If validation fails
    """
    with transaction.atomic():
        # Validate elements
        if len(elements) < 2:
            raise ValidationError("Battle must have at least 2 elements.")
        
        if len(elements) > 10:
            raise ValidationError("Battle cannot have more than 10 elements.")
        
        # Create battle
        battle = Battle.objects.create(
            creator=user,
            title=title,
            description=description,
            category=category,
            deadline=deadline,
            is_public=is_public,
            status=BattleStatusChoices.ACTIVE
        )
        
        # Create elements
        for index, element_data in enumerate(elements):
            Element.objects.create(
                battle=battle,
                name=element_data['name'],
                description=element_data.get('description', ''),
                media_type=element_data.get('media_type', ''),
                media_url=element_data.get('media_url', ''),
                order=index
            )
        
        # Update battle metrics
        battle.update_metrics()
        
        return battle


def battle_update(
    *,
    battle: Battle,
    title: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    deadline: Optional[timezone.datetime] = None,
    is_public: Optional[bool] = None
) -> Battle:
    """
    Update an existing battle.
    
    Args:
        battle: Battle to update
        title: New title
        description: New description
        category: New category
        deadline: New deadline
        is_public: New public status
    
    Returns:
        Updated Battle instance
    """
    if title is not None:
        battle.title = title
    if description is not None:
        battle.description = description
    if category is not None:
        battle.category = category
    if deadline is not None:
        battle.deadline = deadline
    if is_public is not None:
        battle.is_public = is_public
    
    battle.save()
    return battle


def battle_delete(*, battle: Battle, user: User) -> bool:
    """
    Delete a battle (soft delete).
    
    Args:
        battle: Battle to delete
        user: User requesting deletion
    
    Returns:
        True if deleted successfully
    """
    # Check permissions
    if battle.creator != user and not user.is_staff:
        raise ValidationError("You don't have permission to delete this battle.")
    
    battle.soft_delete()
    return True


def battle_like(*, battle: Battle, user: User) -> BattleLike:
    """
    Like a battle.
    
    Args:
        battle: Battle to like
        user: User liking the battle
    
    Returns:
        Created BattleLike instance
    """
    like, created = BattleLike.objects.get_or_create(
        battle=battle,
        user=user
    )
    
    if created:
        battle.update_metrics()
    
    return like


def battle_unlike(*, battle: Battle, user: User) -> bool:
    """
    Unlike a battle.
    
    Args:
        battle: Battle to unlike
        user: User unliking the battle
    
    Returns:
        True if unliked successfully
    """
    try:
        like = BattleLike.objects.get(battle=battle, user=user)
        like.delete()
        battle.update_metrics()
        return True
    except BattleLike.DoesNotExist:
        return False


def battle_share(
    *,
    battle: Battle,
    user: User,
    platform: str = 'internal'
) -> BattleShare:
    """
    Share a battle.
    
    Args:
        battle: Battle to share
        user: User sharing the battle
        platform: Sharing platform
    
    Returns:
        Created BattleShare instance
    """
    share = BattleShare.objects.create(
        battle=battle,
        user=user,
        platform=platform
    )
    
    battle.update_metrics()
    return share


def battle_comment(
    *,
    battle: Battle,
    user: User,
    content: str,
    parent: Optional[BattleComment] = None
) -> BattleComment:
    """
    Add a comment to a battle.
    
    Args:
        battle: Battle to comment on
        user: User commenting
        content: Comment content
        parent: Parent comment for replies
    
    Returns:
        Created BattleComment instance
    """
    comment = BattleComment.objects.create(
        battle=battle,
        user=user,
        content=content,
        parent=parent
    )
    
    battle.update_metrics()
    return comment


def battle_comment_delete(*, comment: BattleComment, user: User) -> bool:
    """
    Delete a battle comment.
    
    Args:
        comment: Comment to delete
        user: User requesting deletion
    
    Returns:
        True if deleted successfully
    """
    # Check permissions
    if comment.user != user and not user.is_staff:
        raise ValidationError("You don't have permission to delete this comment.")
    
    comment.delete()
    comment.battle.update_metrics()
    return True


def battle_increment_views(*, battle: Battle) -> None:
    """
    Increment battle view count.
    
    Args:
        battle: Battle to increment views
    """
    battle.increment_views()


def battle_get_engagement_stats(*, battle: Battle) -> Dict[str, Any]:
    """
    Get battle engagement statistics.
    
    Args:
        battle: Battle to get stats for
    
    Returns:
        Dictionary with engagement statistics
    """
    return {
        'total_votes': battle.total_votes,
        'likes_count': battle.likes_count,
        'shares_count': battle.shares_count,
        'comments_count': battle.comments_count,
        'views': battle.views,
        'trending_score': float(battle.trending_score),
        'vote_velocity': battle.vote_velocity,
        'engagement_score': battle.engagement_score,
    }
