'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Battle } from '@/types/api'

interface BattleCardProps {
  battle: Battle
  onVote?: (battleId: string, elementId: string) => void
  onLike?: (battleId: string) => void
  onShare?: (battleId: string) => void
  variant?: 'default' | 'compact' | 'detailed'
  showVoting?: boolean
}

export function BattleCard({ 
  battle, 
  onVote, 
  onLike, 
  onShare, 
  variant = 'default',
  showVoting = true 
}: BattleCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async (elementId: string) => {
    if (!onVote || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(battle.id, elementId)
    } finally {
      setIsVoting(false)
    }
  }
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(battle.id)
  }
  
  const handleShare = () => {
    onShare?.(battle.id)
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      variant === 'compact' ? 'p-4' : 
      variant === 'detailed' ? 'p-8' : 'p-6'
    }`}>
      {/* Battle header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {battle.category}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(battle.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <h3 className={`font-semibold text-gray-900 mb-2 ${
        variant === 'compact' ? 'text-base' : 'text-lg'
      } line-clamp-2`}>
        {battle.title}
      </h3>
      
      {variant !== 'compact' && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {battle.description}
        </p>
      )}
      
      {/* Battle elements */}
      <div className="space-y-3 mb-4">
        {battle.elements.map((element, index) => (
          <div key={element.id} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                {element.name}
              </span>
              <span className="text-sm text-gray-500">
                {element.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === 0 ? 'bg-red-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${element.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {element.vote_count} votes
            </div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            {isLiked ? (
              <HeartSolidIcon className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 mr-1" />
            )}
            {battle.engagement_stats.likes}
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center text-sm text-gray-500 hover:text-green-500 transition-colors"
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            {battle.engagement_stats.shares}
          </button>
        </div>
        
        {showVoting && (
          <Link
            href={`/battles/${battle.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Vote Now
          </Link>
        )}
      </div>
    </div>
  )
}