export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  meta?: {
    pagination?: {
      page: number
      per_page: number
      total: number
      pages: number
    }
  }
}

export interface Battle {
  id: string
  title: string
  description: string
  category: string
  total_votes: number
  elements: BattleElement[]
  creator: User
  created_at: string
  is_active: boolean
  trending_score: number
  user_voted: boolean
  user_vote_element: string | null
  engagement_stats: {
    total_votes: number
    likes: number
    shares: number
    comments: number
    views: number
  }
}

export interface BattleElement {
  id: string
  name: string
  media_type: 'text' | 'image' | 'audio' | 'video' | 'document'
  media_url?: string
  vote_count: number
  percentage: number
}

export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  battles_count: number
  followers_count: number
  following_count: number
  total_votes_received: number
  created_at: string
}

export interface BattleFilters {
  category?: string
  status?: 'active' | 'expired' | 'draft'
  search?: string
  page?: number
  per_page?: number
}

export interface VoteRequest {
  battle_id: string
  element_id: string
  voter_ip?: string
  fingerprint?: string
}

export interface CreateBattleRequest {
  title?: string
  description?: string
  category: string
  elements: {
    name: string
    media_type: 'text' | 'image' | 'audio' | 'video' | 'document'
  }[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirm_password: string
}

export interface Notification {
  id: string
  type: 'vote_received' | 'battle_trending' | 'user_followed' | 'battle_expired'
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface Language {
  code: string
  name: string
  flag: string
}

export interface TrendingSectionProps {
  title: string
  subtitle: string
  icon: string
  type: 'global' | 'personalized' | 'category' | 'quick-picks'
  category?: string
}
