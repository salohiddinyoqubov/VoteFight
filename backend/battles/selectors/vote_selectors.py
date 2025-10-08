"""
Vote selectors for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import List, Dict, Any, Optional
from django.db.models import Count, Sum, Avg
from django.contrib.auth import get_user_model

from ..models import Vote, Battle, Element

User = get_user_model()


def vote_list(
    *,
    battle_id: Optional[int] = None,
    element_id: Optional[int] = None,
    user_id: Optional[int] = None,
    limit: int = 20,
    offset: int = 0
) -> List[Vote]:
    """
    Get list of votes with optional filtering.
    
    Args:
        battle_id: Optional battle filter
        element_id: Optional element filter
        user_id: Optional user filter
        limit: Number of votes to return
        offset: Offset for pagination
    
    Returns:
        List of Vote instances
    """
    query = {}
    
    if battle_id:
        query['battle_id'] = battle_id
    if element_id:
        query['element_id'] = element_id
    if user_id:
        query['user_id'] = user_id
    
    votes = Vote.objects.filter(**query).select_related(
        'battle', 'element', 'user'
    ).order_by('-created_at')[offset:offset + limit]
    
    return list(votes)


def vote_by_user(
    *,
    user: User,
    limit: int = 20,
    offset: int = 0
) -> List[Vote]:
    """
    Get votes by a specific user.
    
    Args:
        user: User to get votes for
        limit: Number of votes to return
        offset: Offset for pagination
    
    Returns:
        List of Vote instances
    """
    votes = Vote.objects.filter(
        user=user
    ).select_related(
        'battle', 'element'
    ).order_by('-created_at')[offset:offset + limit]
    
    return list(votes)


def vote_by_battle(
    *,
    battle: Battle,
    limit: int = 100,
    offset: int = 0
) -> List[Vote]:
    """
    Get votes for a specific battle.
    
    Args:
        battle: Battle to get votes for
        limit: Number of votes to return
        offset: Offset for pagination
    
    Returns:
        List of Vote instances
    """
    votes = Vote.objects.filter(
        battle=battle
    ).select_related(
        'element', 'user'
    ).order_by('-created_at')[offset:offset + limit]
    
    return list(votes)


def vote_statistics(
    *,
    battle: Optional[Battle] = None,
    element: Optional[Element] = None
) -> Dict[str, Any]:
    """
    Get vote statistics.
    
    Args:
        battle: Optional battle to get statistics for
        element: Optional element to get statistics for
    
    Returns:
        Dictionary with vote statistics
    """
    if battle:
        # Battle-level statistics
        total_votes = Vote.objects.filter(battle=battle).count()
        unique_voters = Vote.objects.filter(battle=battle).values('voter_ip', 'fingerprint').distinct().count()
        
        # Votes by element
        element_stats = []
        for element in battle.elements.all():
            element_votes = Vote.objects.filter(battle=battle, element=element).count()
            percentage = (element_votes / total_votes * 100) if total_votes > 0 else 0
            element_stats.append({
                'element_id': element.id,
                'element_name': element.name,
                'vote_count': element_votes,
                'percentage': round(percentage, 2)
            })
        
        return {
            'total_votes': total_votes,
            'unique_voters': unique_voters,
            'elements': element_stats
        }
    
    elif element:
        # Element-level statistics
        total_votes = Vote.objects.filter(element=element).count()
        battle_total = Vote.objects.filter(battle=element.battle).count()
        percentage = (total_votes / battle_total * 100) if battle_total > 0 else 0
        
        return {
            'element_id': element.id,
            'element_name': element.name,
            'vote_count': total_votes,
            'percentage': round(percentage, 2),
            'battle_total': battle_total
        }
    
    return {}


def vote_recent_activity(
    *,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Get recent voting activity.
    
    Args:
        limit: Number of recent votes to return
    
    Returns:
        List of recent vote activity
    """
    recent_votes = Vote.objects.select_related(
        'battle', 'element', 'user'
    ).order_by('-created_at')[:limit]
    
    activity = []
    for vote in recent_votes:
        activity.append({
            'id': vote.id,
            'battle_id': vote.battle.id,
            'battle_title': vote.battle.title,
            'element_name': vote.element.name,
            'user': {
                'id': vote.user.id if vote.user else None,
                'username': vote.user.username if vote.user else 'Anonymous',
                'avatar_url': vote.user.get_avatar_url() if vote.user else None
            },
            'voted_at': vote.created_at,
            'is_verified': vote.is_verified
        })
    
    return activity
