---
description: VoteFight API Integration Patterns
globs: ["frontend/src/services/**/*.ts", "frontend/src/hooks/**/*.ts", "frontend/src/constants/**/*.ts"]
alwaysApply: true
---

# VoteFight API Integration Patterns

## API Layer Architecture

### 1. API Client Setup
```ts
// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
```

### 2. API Constants
```ts
// constants/api.ts
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  
  // Battles
  BATTLES: '/battles/',
  BATTLE_DETAIL: (id: string) => `/battles/${id}/`,
  BATTLE_VOTE: (id: string) => `/battles/${id}/vote/`,
  
  // Users
  USERS: '/users/',
  USER_PROFILE: (username: string) => `/users/${username}/`,
  USER_BATTLES: (username: string) => `/users/${username}/battles/`,
  
  // Trending
  TRENDING: '/trending/',
  TRENDING_CATEGORY: (category: string) => `/trending/category/${category}/`,
  PERSONALIZED: '/trending/personalized/',
  
  // Media
  MEDIA_UPLOAD: '/media/upload/',
  MEDIA_SECURE: (token: string) => `/media/${token}/`,
} as const

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const
```

### 3. Type Definitions
```ts
// types/api.ts
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
```

### 4. React Query Hooks

#### Query Hooks
```ts
// hooks/useBattles.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { Battle, BattleFilters, ApiResponse } from '@/types/api'

export function useBattles(filters: BattleFilters = {}) {
  return useQuery({
    queryKey: ['battles', filters],
    queryFn: async (): Promise<Battle[]> => {
      const response = await apiClient.get<ApiResponse<Battle[]>>(
        API_ENDPOINTS.BATTLES,
        { params: filters }
      )
      return response.data
    },
    staleTime: 60_000, // 1 minute
    cacheTime: 5 * 60_000, // 5 minutes
  })
}

export function useBattle(id: string) {
  return useQuery({
    queryKey: ['battles', id],
    queryFn: async (): Promise<Battle> => {
      const response = await apiClient.get<ApiResponse<Battle>>(
        API_ENDPOINTS.BATTLE_DETAIL(id)
      )
      return response.data
    },
    enabled: !!id,
    staleTime: 30_000, // 30 seconds
  })
}

export function useTrendingBattles() {
  return useQuery({
    queryKey: ['battles', 'trending'],
    queryFn: async (): Promise<Battle[]> => {
      const response = await apiClient.get<ApiResponse<Battle[]>>(
        API_ENDPOINTS.TRENDING
      )
      return response.data
    },
    staleTime: 5 * 60_000, // 5 minutes
  })
}

export function usePersonalizedBattles() {
  return useQuery({
    queryKey: ['battles', 'personalized'],
    queryFn: async (): Promise<Battle[]> => {
      const response = await apiClient.get<ApiResponse<Battle[]>>(
        API_ENDPOINTS.PERSONALIZED
      )
      return response.data
    },
    staleTime: 10 * 60_000, // 10 minutes
  })
}

export function useUserBattles(username: string) {
  return useQuery({
    queryKey: ['battles', 'user', username],
    queryFn: async (): Promise<Battle[]> => {
      const response = await apiClient.get<ApiResponse<Battle[]>>(
        API_ENDPOINTS.USER_BATTLES(username)
      )
      return response.data
    },
    enabled: !!username,
    staleTime: 2 * 60_000, // 2 minutes
  })
}
```

#### Mutation Hooks
```ts
// hooks/useBattleMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { Battle, VoteRequest, ApiResponse } from '@/types/api'

export function useCreateBattle() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (battleData: Partial<Battle>): Promise<Battle> => {
      const response = await apiClient.post<ApiResponse<Battle>>(
        API_ENDPOINTS.BATTLES,
        battleData
      )
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch battles
      queryClient.invalidateQueries({ queryKey: ['battles'] })
      queryClient.invalidateQueries({ queryKey: ['battles', 'trending'] })
    },
  })
}

export function useVoteBattle() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (voteData: VoteRequest): Promise<void> => {
      await apiClient.post(
        API_ENDPOINTS.BATTLE_VOTE(voteData.battle_id),
        voteData
      )
    },
    onSuccess: (_, variables) => {
      // Invalidate specific battle and battles list
      queryClient.invalidateQueries({ queryKey: ['battles', variables.battle_id] })
      queryClient.invalidateQueries({ queryKey: ['battles'] })
      queryClient.invalidateQueries({ queryKey: ['battles', 'trending'] })
    },
  })
}

export function useLikeBattle() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (battleId: string): Promise<void> => {
      await apiClient.post(`/battles/${battleId}/like/`)
    },
    onSuccess: (_, battleId) => {
      queryClient.invalidateQueries({ queryKey: ['battles', battleId] })
    },
  })
}
```

### 5. Auth Hooks
```ts
// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me/')
        return response.data
      } catch {
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60_000, // 5 minutes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<{ user: User; token: string }> => {
      const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        API_ENDPOINTS.LOGIN,
        credentials
      )
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['auth', 'user'], data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post(API_ENDPOINTS.LOGOUT)
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token')
      queryClient.clear()
    },
  })
}
```

### 6. Error Handling
```ts
// hooks/useApiError.ts
import { toast } from 'react-hot-toast'

export function useApiError() {
  const handleError = (error: any) => {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }
  }

  return { handleError }
}

// Usage in components
export function BattleCard({ battle }: BattleCardProps) {
  const voteMutation = useVoteBattle()
  const { handleError } = useApiError()
  
  const handleVote = (elementId: string) => {
    voteMutation.mutate(
      { battle_id: battle.id, element_id: elementId },
      {
        onError: handleError,
        onSuccess: () => {
          toast.success('Vote submitted!')
        }
      }
    )
  }
  
  return (
    // Component JSX
  )
}
```

### 7. Optimistic Updates
```ts
// hooks/useOptimisticVote.ts
export function useOptimisticVote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (voteData: VoteRequest): Promise<void> => {
      await apiClient.post(API_ENDPOINTS.BATTLE_VOTE(voteData.battle_id), voteData)
    },
    onMutate: async (voteData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['battles', voteData.battle_id] })
      
      // Snapshot previous value
      const previousBattle = queryClient.getQueryData(['battles', voteData.battle_id])
      
      // Optimistically update
      queryClient.setQueryData(['battles', voteData.battle_id], (old: Battle) => {
        if (!old) return old
        
        return {
          ...old,
          elements: old.elements.map(element => 
            element.id === voteData.element_id
              ? { ...element, vote_count: element.vote_count + 1 }
              : element
          ),
          total_votes: old.total_votes + 1
        }
      })
      
      return { previousBattle }
    },
    onError: (err, voteData, context) => {
      // Rollback on error
      if (context?.previousBattle) {
        queryClient.setQueryData(['battles', voteData.battle_id], context.previousBattle)
      }
    },
    onSettled: (_, __, voteData) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['battles', voteData.battle_id] })
    },
  })
}
```

### 8. Pagination Hooks
```ts
// hooks/usePaginatedBattles.ts
export function usePaginatedBattles(filters: BattleFilters = {}) {
  const [page, setPage] = useState(1)
  
  const query = useQuery({
    queryKey: ['battles', 'paginated', page, filters],
    queryFn: async (): Promise<{ data: Battle[]; meta: PaginationMeta }> => {
      const response = await apiClient.get<ApiResponse<Battle[]>>(
        API_ENDPOINTS.BATTLES,
        { params: { ...filters, page } }
      )
      return {
        data: response.data,
        meta: response.meta?.pagination || { page: 1, per_page: 20, total: 0, pages: 1 }
      }
    },
    keepPreviousData: true,
    staleTime: 30_000,
  })
  
  return {
    ...query,
    page,
    setPage,
    hasNextPage: page < (query.data?.meta.pages || 1),
    hasPreviousPage: page > 1,
  }
}
```

### 9. Real-time Updates (WebSocket)
```ts
// hooks/useBattleUpdates.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useBattleUpdates(battleId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/battles/${battleId}/`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'vote_update') {
        // Update battle data optimistically
        queryClient.setQueryData(['battles', battleId], (old: Battle) => {
          if (!old) return old
          
          return {
            ...old,
            elements: old.elements.map(element => 
              element.id === data.element_id
                ? { ...element, vote_count: data.vote_count, percentage: data.percentage }
                : element
            ),
            total_votes: data.total_votes
          }
        })
      }
    }
    
    return () => ws.close()
  }, [battleId, queryClient])
}
```

### 10. Anti-Patterns to Avoid

#### ❌ Don't Do These:
```ts
// ❌ Manual fetch in useEffect
useEffect(() => {
  fetch('/api/battles').then(res => res.json()).then(setBattles)
}, [])

// ❌ Inline API calls
const handleVote = () => {
  fetch('/api/battles/1/vote/', { method: 'POST' })
}

// ❌ No error handling
const { data } = useQuery(['battles'], fetchBattles)

// ❌ No loading states
if (!data) return null

// ❌ Hardcoded URLs
const response = await fetch('http://localhost:8000/api/battles/')
```

#### ✅ Do These Instead:
```ts
// ✅ React Query hooks
const { data: battles, isLoading, error } = useBattles(filters)

// ✅ Mutation hooks
const voteMutation = useVoteBattle()
const handleVote = () => voteMutation.mutate({ battle_id, element_id })

// ✅ Proper error handling
const { data, isLoading, error } = useBattles()
if (error) return <ErrorMessage error={error} />
if (isLoading) return <LoadingSpinner />

// ✅ Constants for URLs
const response = await apiClient.get(API_ENDPOINTS.BATTLES)
```

---

**Remember**: Always use React Query for server state, handle loading and error states properly, and keep API logic centralized in hooks and services.
