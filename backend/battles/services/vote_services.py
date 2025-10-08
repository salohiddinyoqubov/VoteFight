"""
Vote service functions for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import Dict, Any, Optional, Tuple
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache

from ..models import Vote, Battle, Element
from ..models.choices import BattleStatusChoices

User = get_user_model()


def vote_create(
    *,
    battle: Battle,
    element: Element,
    user: Optional[User] = None,
    voter_ip: str,
    fingerprint: str,
    user_agent: str = "",
    session_key: str = ""
) -> Vote:
    """
    Create a vote for a battle element.
    
    Args:
        battle: Battle being voted on
        element: Element being voted for
        user: Optional authenticated user
        voter_ip: Voter's IP address
        fingerprint: Browser fingerprint
        user_agent: User agent string
        session_key: Session key
    
    Returns:
        Created Vote instance
        
    Raises:
        ValidationError: If vote is not allowed
    """
    # Check battle status
    if battle.status != BattleStatusChoices.ACTIVE:
        raise ValidationError("This battle is no longer active.")
    
    if not battle.is_active:
        raise ValidationError("This battle is not active.")
    
    # Check if battle has deadline
    if battle.deadline and battle.deadline <= timezone.now():
        raise ValidationError("This battle has expired.")
    
    # Check if user has already voted
    if Vote.has_user_voted(battle, voter_ip, fingerprint, user):
        raise ValidationError("You have already voted in this battle.")
    
    # Check cooldown period
    cooldown_remaining = Vote.get_vote_cooldown_remaining(voter_ip, fingerprint)
    if cooldown_remaining > 0:
        raise ValidationError(f"Please wait {int(cooldown_remaining)} seconds before voting again.")
    
    # Check rate limits
    is_limited, remaining_votes, reset_time = Vote.get_vote_rate_limit_status(voter_ip, fingerprint)
    if is_limited:
        raise ValidationError("Rate limit exceeded. Please try again later.")
    
    with transaction.atomic():
        # Create vote
        vote = Vote.objects.create(
            battle=battle,
            element=element,
            user=user,
            voter_ip=voter_ip,
            fingerprint=fingerprint,
            user_agent=user_agent,
            session_key=session_key
        )
        
        # Update battle metrics
        battle.update_metrics()
        
        # Update trending score
        battle.calculate_trending_score()
        
        # Cache vote eligibility
        cache_key = f"vote_eligibility_{voter_ip}_{fingerprint}_{battle.id}"
        cache.set(cache_key, False, timeout=3600)  # 1 hour
        
        return vote


def vote_delete(*, vote: Vote, user: Optional[User] = None) -> bool:
    """
    Delete a vote.
    
    Args:
        vote: Vote to delete
        user: Optional authenticated user
    
    Returns:
        True if deleted successfully
    """
    # Check permissions
    if user and vote.user != user:
        raise ValidationError("You don't have permission to delete this vote.")
    
    battle = vote.battle
    vote.delete()
    
    # Update battle metrics
    battle.update_metrics()
    battle.calculate_trending_score()
    
    return True


def check_vote_eligibility(
    *,
    battle: Battle,
    user: Optional[User] = None,
    voter_ip: str,
    fingerprint: str
) -> Dict[str, Any]:
    """
    Check if user is eligible to vote.
    
    Args:
        battle: Battle to check
        user: Optional authenticated user
        voter_ip: Voter's IP address
        fingerprint: Browser fingerprint
    
    Returns:
        Dictionary with eligibility status and details
    """
    # Check battle status
    if battle.status != BattleStatusChoices.ACTIVE:
        return {
            'eligible': False,
            'reason': 'battle_inactive',
            'message': 'This battle is no longer active.'
        }
    
    if not battle.is_active:
        return {
            'eligible': False,
            'reason': 'battle_inactive',
            'message': 'This battle is not active.'
        }
    
    # Check deadline
    if battle.deadline and battle.deadline <= timezone.now():
        return {
            'eligible': False,
            'reason': 'battle_expired',
            'message': 'This battle has expired.'
        }
    
    # Check if already voted
    if Vote.has_user_voted(battle, voter_ip, fingerprint, user):
        return {
            'eligible': False,
            'reason': 'already_voted',
            'message': 'You have already voted in this battle.'
        }
    
    # Check cooldown
    cooldown_remaining = Vote.get_vote_cooldown_remaining(voter_ip, fingerprint)
    if cooldown_remaining > 0:
        return {
            'eligible': False,
            'reason': 'cooldown',
            'message': f'Please wait {int(cooldown_remaining)} seconds before voting again.',
            'cooldown_remaining': int(cooldown_remaining)
        }
    
    # Check rate limits
    is_limited, remaining_votes, reset_time = Vote.get_vote_rate_limit_status(voter_ip, fingerprint)
    if is_limited:
        return {
            'eligible': False,
            'reason': 'rate_limited',
            'message': 'Rate limit exceeded. Please try again later.',
            'reset_time': reset_time
        }
    
    return {
        'eligible': True,
        'reason': 'eligible',
        'message': 'You are eligible to vote.',
        'remaining_votes': remaining_votes
    }


def get_vote_statistics(*, battle: Battle) -> Dict[str, Any]:
    """
    Get vote statistics for a battle.
    
    Args:
        battle: Battle to get statistics for
    
    Returns:
        Dictionary with vote statistics
    """
    elements = battle.elements.all()
    total_votes = battle.total_votes
    
    element_stats = []
    for element in elements:
        percentage = (element.vote_count / total_votes * 100) if total_votes > 0 else 0
        element_stats.append({
            'id': element.id,
            'name': element.name,
            'vote_count': element.vote_count,
            'percentage': round(percentage, 2)
        })
    
    return {
        'total_votes': total_votes,
        'elements': element_stats,
        'battle_id': battle.id,
        'battle_title': battle.title
    }


def get_user_vote_history(
    *,
    user: User,
    limit: int = 20,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Get user's vote history.
    
    Args:
        user: User to get history for
        limit: Number of votes to return
        offset: Offset for pagination
    
    Returns:
        Dictionary with vote history
    """
    votes = Vote.objects.filter(user=user).select_related(
        'battle', 'element'
    ).order_by('-created_at')[offset:offset + limit]
    
    vote_history = []
    for vote in votes:
        vote_history.append({
            'id': vote.id,
            'battle_id': vote.battle.id,
            'battle_title': vote.battle.title,
            'element_name': vote.element.name,
            'voted_at': vote.created_at,
            'battle_category': vote.battle.category
        })
    
    return {
        'votes': vote_history,
        'total_count': Vote.objects.filter(user=user).count(),
        'limit': limit,
        'offset': offset
    }
