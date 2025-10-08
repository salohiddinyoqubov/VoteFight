---
description: VoteFight API Standards - Axios only, no WebSocket, 5-minute updates
globs: ["frontend/src/**/*.ts", "frontend/src/**/*.tsx", "frontend/src/**/*.js", "frontend/src/**/*.jsx"]
alwaysApply: true
---

# VoteFight API Standards

## API Integration Rules

### ✅ ALWAYS Use Axios Only
```tsx
// ✅ Correct - Use Axios for all API calls
import axios from 'axios'

// ❌ WRONG - Don't use React Query, SWR, or other libraries
import { useQuery } from '@tanstack/react-query'
import useSWR from 'swr'
```

### ✅ NO WebSocket - Use 5-minute Polling
```tsx
// ✅ Correct - Use setInterval for 5-minute updates
useEffect(() => {
  const interval = setInterval(() => {
    fetchBattles()
  }, 5 * 60 * 1000) // 5 minutes

  return () => clearInterval(interval)
}, [])

// ❌ WRONG - Don't use WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/battles/')
```

## API Client Setup

### Axios Configuration
```tsx
// services/apiClient.ts
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## Data Fetching Patterns

### ✅ Correct - Axios with useEffect
```tsx
// hooks/useBattles.ts
import { useState, useEffect } from 'react'
import { apiClient } from '@/services/apiClient'
import { Battle } from '@/types/api'

export function useBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBattles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/battles/')
      setBattles(response.data.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBattles()
    
    // 5-minute polling
    const interval = setInterval(fetchBattles, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error, refetch: fetchBattles }
}
```

### ❌ Wrong - React Query or SWR
```tsx
// ❌ Don't use React Query
import { useQuery } from '@tanstack/react-query'

// ❌ Don't use SWR
import useSWR from 'swr'

// ❌ Don't use WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/')
```

## API Service Functions

### Battle Services
```tsx
// services/battleService.ts
import { apiClient } from '@/services/apiClient'
import { Battle, CreateBattleRequest, VoteRequest } from '@/types/api'

export const battleService = {
  // Get all battles
  async getBattles(filters?: any): Promise<Battle[]> {
    const response = await apiClient.get('/battles/', { params: filters })
    return response.data.data
  },

  // Get single battle
  async getBattle(id: string): Promise<Battle> {
    const response = await apiClient.get(`/battles/${id}/`)
    return response.data.data
  },

  // Create battle
  async createBattle(data: CreateBattleRequest): Promise<Battle> {
    const response = await apiClient.post('/battles/', data)
    return response.data.data
  },

  // Vote on battle
  async voteBattle(data: VoteRequest): Promise<void> {
    await apiClient.post(`/battles/${data.battle_id}/vote/`, data)
  },

  // Like battle
  async likeBattle(id: string): Promise<void> {
    await apiClient.post(`/battles/${id}/like/`)
  },

  // Share battle
  async shareBattle(id: string): Promise<void> {
    await apiClient.post(`/battles/${id}/share/`)
  }
}
```

### User Services
```tsx
// services/userService.ts
import { apiClient } from '@/services/apiClient'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

export const userService = {
  // Login
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/login/', data)
    return response.data.data
  },

  // Register
  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/register/', data)
    return response.data.data
  },

  // Get user profile
  async getUserProfile(username: string): Promise<User> {
    const response = await apiClient.get(`/users/${username}/`)
    return response.data.data
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put('/users/me/', data)
    return response.data.data
  }
}
```

## Polling Patterns

### 5-Minute Statistics Updates
```tsx
// hooks/useBattleStats.ts
import { useState, useEffect } from 'react'
import { battleService } from '@/services/battleService'

export function useBattleStats(battleId: string) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const battle = await battleService.getBattle(battleId)
      setStats({
        totalVotes: battle.total_votes,
        elements: battle.elements.map(el => ({
          id: el.id,
          name: el.name,
          voteCount: el.vote_count,
          percentage: el.percentage
        }))
      })
    } catch (error) {
      console.error('Failed to fetch battle stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Update every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [battleId])

  return { stats, loading, refetch: fetchStats }
}
```

### Trending Updates
```tsx
// hooks/useTrendingBattles.ts
import { useState, useEffect } from 'react'
import { battleService } from '@/services/battleService'

export function useTrendingBattles() {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrending = async () => {
    try {
      setLoading(true)
      const trendingBattles = await battleService.getBattles({ trending: true })
      setBattles(trendingBattles)
    } catch (error) {
      console.error('Failed to fetch trending battles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrending()
    
    // Update trending every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, refetch: fetchTrending }
}
```

## Error Handling

### Global Error Handler
```tsx
// utils/errorHandler.ts
import { toast } from 'react-hot-toast'

export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    toast.error(error.response.data.message)
  } else if (error.message) {
    toast.error(error.message)
  } else {
    toast.error('An unexpected error occurred')
  }
}

// Usage in components
const handleVote = async (battleId: string, elementId: string) => {
  try {
    await battleService.voteBattle({ battle_id: battleId, element_id: elementId })
    toast.success('Vote submitted!')
  } catch (error) {
    handleApiError(error)
  }
}
```

## Mock Data for Development

### Mock API Client
```tsx
// services/mockApiClient.ts
import { mockBattles, mockUsers } from '@/mocks/data'

export const mockApiClient = {
  get: async (url: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (url.includes('/battles/')) {
      return { data: { data: mockBattles } }
    }
    if (url.includes('/users/')) {
      return { data: { data: mockUsers[0] } }
    }
    return { data: { data: [] } }
  },
  
  post: async (url: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { data: { data: { success: true } } }
  }
}
```

## Anti-Patterns to Avoid

### ❌ Don't Use These:
```tsx
// ❌ React Query
import { useQuery } from '@tanstack/react-query'

// ❌ SWR
import useSWR from 'swr'

// ❌ WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/')

// ❌ Fetch API
const response = await fetch('/api/battles/')

// ❌ Real-time updates
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8000/ws/battles/')
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    setBattles(data.battles)
  }
}, [])
```

### ✅ Always Use These:
```tsx
// ✅ Axios only
import axios from 'axios'

// ✅ 5-minute polling
useEffect(() => {
  const interval = setInterval(fetchData, 5 * 60 * 1000)
  return () => clearInterval(interval)
}, [])

// ✅ Service functions
import { battleService } from '@/services/battleService'
```

---

**Remember**: 
- Use Axios only for API calls
- No WebSocket - use 5-minute polling instead
- All imports must use `@/` paths
- Use service functions for API calls
- Handle errors with toast notifications
