'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Header } from '@/components/layout/Header'
import { BattleCard } from '@/components/battles/BattleCard'

interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  battlesCount: number
  followersCount: number
  followingCount: number
  totalVotesReceived: number
  createdAt: string
}

interface Battle {
  id: string
  title: string
  description: string
  category: string
  totalVotes: number
  elements: Array<{
    id: string
    name: string
    voteCount: number
    percentage: number
  }>
  creator: {
    username: string
    avatar: string | null
  }
  createdAt: string
  trendingScore: number
}

interface UserProfilePageProps {
  username: string
}

export default function UserProfilePage({ username }: UserProfilePageProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [battles, setBattles] = useState<Battle[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'battles' | 'following' | 'followers'>('battles')

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockUser: User = {
      id: '1',
      username: username,
      email: `${username}@example.com`,
      avatar: null,
      bio: `Hi! I'm ${username} and I love creating voting battles. Join me in the fun!`,
      battlesCount: 12,
      followersCount: 156,
      followingCount: 89,
      totalVotesReceived: 2340,
      createdAt: '2024-01-01T00:00:00Z'
    }

    const mockBattles: Battle[] = [
      {
        id: '1',
        title: 'iPhone 15 vs Samsung Galaxy S24',
        description: 'Which flagship phone is better?',
        category: 'technology',
        totalVotes: 1250,
        elements: [
          { id: '1', name: 'iPhone 15', voteCount: 750, percentage: 60 },
          { id: '2', name: 'Samsung Galaxy S24', voteCount: 500, percentage: 40 }
        ],
        creator: {
          username: username,
          avatar: null
        },
        createdAt: '2024-01-15T10:30:00Z',
        trendingScore: 95.5
      },
      {
        id: '2',
        title: 'Coffee vs Tea',
        description: 'Morning drink preference',
        category: 'food',
        totalVotes: 450,
        elements: [
          { id: '3', name: 'Coffee', voteCount: 280, percentage: 62 },
          { id: '4', name: 'Tea', voteCount: 170, percentage: 38 }
        ],
        creator: {
          username: username,
          avatar: null
        },
        createdAt: '2024-01-14T08:15:00Z',
        trendingScore: 72.3
      }
    ]

    setUser(mockUser)
    setBattles(mockBattles)
    setIsLoading(false)
  }, [username])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    if (user) {
      setUser({
        ...user,
        followersCount: isFollowing ? user.followersCount - 1 : user.followersCount + 1
      })
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.username}'s Profile`,
        text: `Check out ${user?.username}'s battles on VoteFight!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
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

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
                  <p className="text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="h-4 w-4 mr-1 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4 mr-1" />
                    )}
                    Like
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center text-sm text-gray-500 hover:text-green-500 transition-colors"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Share
                  </button>
                  
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinusIcon className="h-4 w-4 mr-1 inline" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4 mr-1 inline" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.battlesCount}</div>
                  <div className="text-sm text-gray-500">Battles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.followersCount}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.followingCount}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.totalVotesReceived}</div>
                  <div className="text-sm text-gray-500">Votes Received</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'battles', label: 'Battles', count: user.battlesCount },
                { id: 'following', label: 'Following', count: user.followingCount },
                { id: 'followers', label: 'Followers', count: user.followersCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'battles' && (
              <div className="space-y-6">
                {battles.length > 0 ? (
                  battles.map((battle) => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No battles created yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Following list will be displayed here.</p>
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Followers list will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
