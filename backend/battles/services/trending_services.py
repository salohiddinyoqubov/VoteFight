"""
Trending services for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import List, Dict, Any, Optional
from django.db.models import Q, F, Count, Sum
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

from ..models import Battle
from ..models.choices import BattleStatusChoices, CategoryChoices


def update_trending_scores() -> Dict[str, int]:
    """
    Update trending scores for all active battles.
    
    Returns:
        Dictionary with update statistics
    """
    active_battles = Battle.objects.filter(
        status=BattleStatusChoices.ACTIVE,
        is_active=True
    )
    
    updated_count = 0
    for battle in active_battles:
        calculate_battle_trending_score(battle=battle)
        updated_count += 1
    
    # Clear trending cache
    cache.delete('trending_battles')
    cache.delete('trending_battles_global')
    
    return {
        'updated_battles': updated_count,
        'timestamp': timezone.now()
    }


def get_trending_battles(
    *,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Get trending battles.
    
    Args:
        category: Optional category filter
        limit: Number of battles to return
        offset: Offset for pagination
    
    Returns:
        List of trending battle data
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
    
    trending_data = []
    for battle in battles:
        trending_data.append({
            'id': battle.id,
            'title': battle.title,
            'description': battle.description,
            'category': battle.category,
            'creator': {
                'id': battle.creator.id,
                'username': battle.creator.username,
                'avatar_url': battle.creator.get_avatar_url()
            },
            'trending_score': float(battle.trending_score),
            'total_votes': battle.total_votes,
            'likes_count': battle.likes_count,
            'views': battle.views,
            'created_at': battle.created_at,
            'elements': [
                {
                    'id': element.id,
                    'name': element.name,
                    'vote_count': element.vote_count,
                    'vote_percentage': float(element.vote_percentage)
                }
                for element in battle.elements.all()
            ]
        })
    
    # Cache result for 5 minutes
    cache.set(cache_key, trending_data, timeout=300)
    
    return trending_data


def calculate_battle_trending_score(*, battle: Battle) -> float:
    """
    Calculate trending score for a specific battle.
    
    Args:
        battle: Battle to calculate score for
    
    Returns:
        Calculated trending score
    """
    now = timezone.now()
    hours_since_creation = (now - battle.created_at).total_seconds() / 3600
    
    # Vote velocity (votes per hour in last 24 hours)
    recent_votes = battle.votes.filter(
        created_at__gte=now - timedelta(hours=24)
    ).count()
    vote_velocity = recent_votes / max(1, min(24, hours_since_creation))
    
    # Engagement score
    engagement_score = (
        battle.likes_count * 2 +
        battle.shares_count * 3 +
        battle.comments_count * 1 +
        battle.views * 0.1
    )
    
    # Time decay factor (newer battles get higher scores)
    time_decay = max(0.1, 1 - (hours_since_creation / 168))  # 1 week decay
    
    # Category trending factor
    category_trending = get_category_trending_factor(battle.category)
    
    # Calculate final trending score
    trending_score = (
        vote_velocity * 0.4 +
        engagement_score * 0.3 +
        battle.total_votes * 0.2 +
        time_decay * 0.1 +
        category_trending * 0.1
    )
    
    # Update battle
    battle.trending_score = trending_score
    battle.vote_velocity = int(vote_velocity)
    battle.engagement_score = int(engagement_score)
    battle.save(update_fields=[
        'trending_score', 'vote_velocity', 'engagement_score'
    ])
    
    return trending_score


def get_category_trending_factor(category: str) -> float:
    """
    Get trending factor for a category.
    
    Args:
        category: Category to get factor for
    
    Returns:
        Category trending factor
    """
    # Get recent battles in category
    recent_battles = Battle.objects.filter(
        category=category,
        status=BattleStatusChoices.ACTIVE,
        is_active=True,
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Calculate factor based on category activity
    if recent_battles > 10:
        return 1.2  # High activity
    elif recent_battles > 5:
        return 1.0  # Normal activity
    else:
        return 0.8  # Low activity


def get_trending_categories(*, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get trending categories.
    
    Args:
        limit: Number of categories to return
    
    Returns:
        List of trending category data
    """
    cache_key = f"trending_categories_{limit}"
    cached_result = cache.get(cache_key)
    
    if cached_result:
        return cached_result
    
    # Get category statistics
    category_stats = Battle.objects.filter(
        status=BattleStatusChoices.ACTIVE,
        is_active=True,
        is_public=True,
        created_at__gte=timezone.now() - timedelta(days=7)
    ).values('category').annotate(
        battle_count=Count('id'),
        total_votes=Sum('total_votes'),
        avg_trending_score=Sum('trending_score') / Count('id')
    ).order_by('-total_votes')[:limit]
    
    trending_categories = []
    for stat in category_stats:
        trending_categories.append({
            'category': stat['category'],
            'category_display': dict(CategoryChoices.choices)[stat['category']],
            'battle_count': stat['battle_count'],
            'total_votes': stat['total_votes'] or 0,
            'avg_trending_score': float(stat['avg_trending_score'] or 0)
        })
    
    # Cache result for 30 minutes
    cache.set(cache_key, trending_categories, timeout=1800)
    
    return trending_categories


def get_personalized_trending(
    *,
    user_id: int,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Get personalized trending battles for a user.
    
    Args:
        user_id: User ID
        limit: Number of battles to return
    
    Returns:
        List of personalized trending battle data
    """
    cache_key = f"personalized_trending_{user_id}_{limit}"
    cached_result = cache.get(cache_key)
    
    if cached_result:
        return cached_result
    
    # Get user's voting history to determine preferences
    user_votes = Battle.objects.filter(
        votes__user_id=user_id
    ).values_list('category', flat=True).distinct()
    
    # Get user's created battles categories
    user_battles = Battle.objects.filter(
        creator_id=user_id
    ).values_list('category', flat=True).distinct()
    
    # Combine preferences
    preferred_categories = list(set(list(user_votes) + list(user_battles)))
    
    # Build query with category preferences
    query = Q(
        status=BattleStatusChoices.ACTIVE,
        is_active=True,
        is_public=True
    )
    
    if preferred_categories:
        query &= Q(category__in=preferred_categories)
    
    # Get personalized trending battles
    battles = Battle.objects.filter(query).select_related(
        'creator'
    ).prefetch_related(
        'elements'
    ).order_by('-trending_score')[:limit]
    
    personalized_data = []
    for battle in battles:
        personalized_data.append({
            'id': battle.id,
            'title': battle.title,
            'description': battle.description,
            'category': battle.category,
            'creator': {
                'id': battle.creator.id,
                'username': battle.creator.username,
                'avatar_url': battle.creator.get_avatar_url()
            },
            'trending_score': float(battle.trending_score),
            'total_votes': battle.total_votes,
            'likes_count': battle.likes_count,
            'views': battle.views,
            'created_at': battle.created_at,
            'elements': [
                {
                    'id': element.id,
                    'name': element.name,
                    'vote_count': element.vote_count,
                    'vote_percentage': float(element.vote_percentage)
                }
                for element in battle.elements.all()
            ]
        })
    
    # Cache result for 10 minutes
    cache.set(cache_key, personalized_data, timeout=600)
    
    return personalized_data
