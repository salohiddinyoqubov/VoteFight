"""
Element selectors for VoteFight application.
Following Django Styleguide patterns.
"""
from typing import List, Optional
from django.db.models import Prefetch

from ..models import Element, Vote


def element_list(
    *,
    battle_id: int,
    limit: int = 10,
    offset: int = 0
) -> List[Element]:
    """
    Get list of elements for a battle.
    
    Args:
        battle_id: Battle ID
        limit: Number of elements to return
        offset: Offset for pagination
    
    Returns:
        List of Element instances
    """
    elements = Element.objects.filter(
        battle_id=battle_id
    ).prefetch_related(
        Prefetch('votes', queryset=Vote.objects.all())
    ).order_by('order', 'created_at')[offset:offset + limit]
    
    return list(elements)


def element_detail(*, element_id: int) -> Optional[Element]:
    """
    Get detailed element information.
    
    Args:
        element_id: Element ID
    
    Returns:
        Element instance or None
    """
    try:
        return Element.objects.select_related(
            'battle'
        ).prefetch_related(
            Prefetch('votes', queryset=Vote.objects.select_related('user'))
        ).get(id=element_id)
    except Element.DoesNotExist:
        return None


def element_get(*, element_id: int) -> Optional[Element]:
    """
    Get a single element by ID.
    
    Args:
        element_id: Element ID
    
    Returns:
        Element instance or None
    """
    try:
        return Element.objects.select_related('battle').get(id=element_id)
    except Element.DoesNotExist:
        return None
