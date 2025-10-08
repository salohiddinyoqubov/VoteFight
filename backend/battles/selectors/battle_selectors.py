"""
Battle selectors for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import List, Dict, Any, Optional
from django.db.models import Q, F, Count, Prefetch
from django.core.cache import cache
from django.contrib.auth import get_user_model

from ..models import Battle, Element, Vote, BattleLike, BattleComment
from ..models.choices import BattleStatusChoices, CategoryChoices

User = get_user_model()


def battle_list(
    *,
    user: Optional[User] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    is_public: bool = True,
    limit: int = 20,
    offset: int = 0,
    ordering: str = '-created_at'
) -> List[Battle]:
    """
    Get list of battles with optional filtering.
    
    Args:
        user: Optional user for personalized results
        category: Optional category filter
        status: Optional status filter
        is_public: Filter for public battles
        limit: Number of battles to return
        offset: Offset for pagination
        ordering: Ordering field
    
    Returns:
        List of Battle instances
    """
    # Build query
    query = Q()
    
    if is_public:
        query &= Q(is_public=True)
    
    if category:
        query &= Q(category=category)
    
    if status:
        query &= Q(status=status)
    else:
        query &= Q(status=BattleStatusChoices.ACTIVE)
    
    # Get battles with optimized queries
    battles = Battle.objects.filter(query).select_related(
        'creator'
    ).prefetch_related(
        'elements',
        Prefetch('votes', queryset=Vote.objects.select_related('element')),
        'likes',
        'comments'
    ).order_by(ordering)[offset:offset + limit]
    
    return list(battles)


def battle_detail(
    *,
    battle_id: int,
    user: Optional[User] = None,
    increment_views: bool = True
) -> Optional[Battle]:
    """
    Get detailed battle information.
    
    Args:
        battle_id: Battle ID
        user: Optional user for personalized data
        increment_views: Whether to increment view count
    
    Returns:
        Battle instance or None
    """
    try:
        battle = Battle.objects.select_related(
            'creator'
        ).prefetch_related(
            'elements',
            Prefetch('votes', queryset=Vote.objects.select_related('element')),
            'likes',
            'comments'
        ).get(id=battle_id)
        
        # Increment views if requested
        if increment_views:
            battle.increment_views()
        
        return battle
    except Battle.DoesNotExist:
        return None


def battle_get(*, battle_id: int) -> Optional[Battle]:
    """
    Get a single battle by ID.
    
    Args:
        battle_id: Battle ID
    
    Returns:
        Battle instance or None
    """
    try:
        return Battle.objects.select_related('creator').get(id=battle_id)
    except Battle.DoesNotExist:
        return None


def battle_search(
    *,
    query: str,
    user: Optional[User] = None,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
) -> List[Battle]:
    """
    Search battles by title and description.
    
    Args:
        query: Search query
        user: Optional user for personalized results
        category: Optional category filter
        limit: Number of battles to return
        offset: Offset for pagination
    
    Returns:
        List of matching Battle instances
    """
    # Build search query
    search_query = Q(
        title__icontains=query
    ) | Q(
        description__icontains=query
    )
    
    # Add category filter
    if category:
        search_query &= Q(category=category)
    
    # Add public filter
    search_query &= Q(is_public=True, status=BattleStatusChoices.ACTIVE)
    
    # Get search results
    battles = Battle.objects.filter(search_query).select_related(
        'creator'
    ).prefetch_related(
        'elements'
    ).order_by('-trending_score')[offset:offset + limit]
    
    return list(battles)


def battle_by_category(
    *,
    category: str,
    limit: int = 20,
    offset: int = 0
) -> List[Battle]:
    """
    Get battles by category.
    
    Args:
        category: Category to filter by
        limit: Number of battles to return
        offset: Offset for pagination
    
    Returns:
        List of Battle instances
    """
    battles = Battle.objects.filter(
        category=category,
        status=BattleStatusChoices.ACTIVE,
        is_public=True
    ).select_related(
        'creator'
    ).prefetch_related(
        'elements'
    ).order_by('-trending_score')[offset:offset + limit]
    
    return list(battles)


def battle_by_user(
    *,
    user: User,
    limit: int = 20,
    offset: int = 0
) -> List[Battle]:
    """
    Get battles created by a user.
    
    Args:
        user: User to get battles for
        limit: Number of battles to return
        offset: Offset for pagination
    
    Returns:
        List of Battle instances
    """
    battles = Battle.objects.filter(
        creator=user,
        status=BattleStatusChoices.ACTIVE
    ).select_related(
        'creator'
    ).prefetch_related(
        'elements'
    ).order_by('-created_at')[offset:offset + limit]
    
    return list(battles)


def battle_trending(
    *,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
) -> List[Battle]:
    """
    Get trending battles.
    
    Args:
        category: Optional category filter
        limit: Number of battles to return
        offset: Offset for pagination
    
    Returns:
        List of trending Battle instances
    """
    cache_key = f"trending_battles_{category}_{limit}_{offset}"
    cached_result = cache.get(cache_key)
    
    if cached_result:
        return cached_result
    
    # Build query
    query = Q(
        status=BattleStatusChoices.ACTIVE,
        is_active=True,
        is_public=True
    )
    
    if category:
        query &= Q(category=category)
    
    # Get trending battles
    battles = Battle.objects.filter(query).select_related(
        'creator'
    ).prefetch_related(
        'elements'
    ).order_by('-trending_score')[offset:offset + limit]
    
    battle_list = list(battles)
    
    # Cache result for 5 minutes
    cache.set(cache_key, battle_list, timeout=300)
    
    return battle_list


def battle_user_voted(
    *,
    battle: Battle,
    user: Optional[User] = None,
    voter_ip: Optional[str] = None,
    fingerprint: Optional[str] = None
) -> bool:
    """
    Check if user has voted in a battle.
    
    Args:
        battle: Battle to check
        user: Optional authenticated user
        voter_ip: Optional voter IP
        fingerprint: Optional fingerprint
    
    Returns:
        True if user has voted
    """
    if user and user.is_authenticated:
        return Vote.objects.filter(
            battle=battle,
            user=user
        ).exists()
    
    if voter_ip and fingerprint:
        return Vote.objects.filter(
            battle=battle,
            voter_ip=voter_ip,
            fingerprint=fingerprint
        ).exists()
    
    return False


def battle_user_vote_element(
    *,
    battle: Battle,
    user: Optional[User] = None,
    voter_ip: Optional[str] = None,
    fingerprint: Optional[str] = None
) -> Optional[Element]:
    """
    Get the element that user voted for in a battle.
    
    Args:
        battle: Battle to check
        user: Optional authenticated user
        voter_ip: Optional voter IP
        fingerprint: Optional fingerprint
    
    Returns:
        Element instance or None
    """
    vote = None
    
    if user and user.is_authenticated:
        vote = Vote.objects.filter(
            battle=battle,
            user=user
        ).select_related('element').first()
    
    if not vote and voter_ip and fingerprint:
        vote = Vote.objects.filter(
            battle=battle,
            voter_ip=voter_ip,
            fingerprint=fingerprint
        ).select_related('element').first()
    
    return vote.element if vote else None


def battle_statistics(*, battle: Battle) -> Dict[str, Any]:
    """
    Get battle statistics.
    
    Args:
        battle: Battle to get statistics for
    
    Returns:
        Dictionary with battle statistics
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
        'created_at': battle.created_at,
        'updated_at': battle.updated_at,
    }
