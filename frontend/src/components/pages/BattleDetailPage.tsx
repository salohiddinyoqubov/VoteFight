'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, HeartIcon, ShareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Header } from '@/components/layout/Header'
import { RichMediaElement } from '@/components/media/RichMediaElement'
import { useBattle } from '@/hooks/useBattles'
import { useVoting } from '@/hooks/useVoting'
import { Battle } from '@/types/api'

interface BattleDetailPageProps {
  battleId: string
}

export function BattleDetailPage({ battleId }: BattleDetailPageProps) {
  const router = useRouter()
  const { battle, loading, error } = useBattle(battleId)
  const { isVoting, voteBattle, likeBattle, shareBattle } = useVoting()
  const [isLiked, setIsLiked] = useState(false)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  const handleVote = async (elementId: string) => {
    if (!battle || isVoting) return
    
    try {
      await voteBattle({
        battle_id: battle.id,
        element_id: elementId
      })
      setSelectedElement(elementId)
    } catch (error) {
      console.error('Vote failed:', error)
    }
  }

  const handleLike = async () => {
    if (!battle) return
    
    try {
      await likeBattle(battle.id)
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Like failed:', error)
    }
  }

  const handleShare = async () => {
    if (!battle) return
    
    try {
      await shareBattle(battle.id)
      if (navigator.share) {
        navigator.share({
          title: battle.title,
          text: `Check out this battle: ${battle.title}`,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Battle not found</h1>
            <button
              onClick={() => router.push('/')}
              className="text-red-600 hover:text-red-700"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Battle Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {battle.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(battle.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {battle.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {battle.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <span>by @{battle.creator.username}</span>
              <span className="mx-2">•</span>
              <span>{battle.total_votes} votes</span>
            </div>
            
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
              
              <button className="flex items-center text-sm text-gray-500 hover:text-blue-500 transition-colors">
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                {battle.engagement_stats.comments}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center text-sm text-gray-500 hover:text-green-500 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                {battle.engagement_stats.shares}
              </button>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        {battle.is_active && !battle.user_voted && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose your favorite:</h2>
            <div className="space-y-4">
              {battle.elements.map((element, index) => (
                <div key={element.id} className="relative">
                  <button
                    onClick={() => handleVote(element.id)}
                    disabled={isVoting}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:border-red-300 ${
                      selectedElement === element.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-medium text-gray-900">
                          {index + 1}.
                        </span>
                        <span className="text-lg font-medium text-gray-900">
                          {element.name}
                        </span>
                      </div>
                      {isVoting && selectedElement === element.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
          <div className="space-y-4">
            {battle.elements.map((element, index) => (
              <div key={element.id} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {element.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {element.percentage}% ({element.vote_count} votes)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${element.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {battle.user_voted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ You have voted in this battle!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}