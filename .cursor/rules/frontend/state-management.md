---
description: VoteFight State Management Patterns with Zustand and React Query
globs: ["frontend/src/store/**/*.ts", "frontend/src/hooks/**/*.ts", "frontend/src/components/**/*.tsx"]
alwaysApply: true
---

# VoteFight State Management Patterns

## State Management Architecture

### 1. State Categories and Tools

| State Type | Tool | When to Use | Example |
|------------|------|-------------|---------|
| Server Data | React Query | API data, caching, sync | `useBattles()`, `useUser()` |
| Auth State | Zustand | User session, tokens | `authStore` |
| UI State | Local useState | Component-specific | Modal open/close |
| Cross-component UI | Zustand | Theme, drawer, filters | `uiStore` |
| Form State | React Hook Form | Form validation, submission | Battle creation form |

### 2. Zustand Store Patterns

#### Auth Store
```ts
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthenticated: true, isLoading: false })
      },
      
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}))

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
  setLoading: state.setLoading,
}))
```

#### UI Store
```ts
// store/uiStore.ts
import { create } from 'zustand'

interface UIState {
  // Theme
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Modals
  createBattleModalOpen: boolean
  setCreateBattleModalOpen: (open: boolean) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  
  // Filters
  battleFilters: BattleFilters
  setBattleFilters: (filters: Partial<BattleFilters>) => void
  clearFilters: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export const useUIStore = create<UIState>((set, get) => ({
  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Modals
  createBattleModalOpen: false,
  setCreateBattleModalOpen: (open) => set({ createBattleModalOpen: open }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }))
    
    // Auto remove after duration
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  // Filters
  battleFilters: {},
  setBattleFilters: (filters) => {
    set((state) => ({
      battleFilters: { ...state.battleFilters, ...filters }
    }))
  },
  
  clearFilters: () => set({ battleFilters: {} }),
}))

// Selectors
export const useTheme = () => useUIStore((state) => state.theme)
export const useSidebar = () => useUIStore((state) => ({
  isOpen: state.sidebarOpen,
  toggle: () => state.setSidebarOpen(!state.sidebarOpen),
  open: () => state.setSidebarOpen(true),
  close: () => state.setSidebarOpen(false),
}))
export const useNotifications = () => useUIStore((state) => state.notifications)
export const useBattleFilters = () => useUIStore((state) => state.battleFilters)
```

#### Battle Store (for complex battle state)
```ts
// store/battleStore.ts
import { create } from 'zustand'
import { Battle, BattleElement } from '@/types/api'

interface BattleState {
  // Current battle being viewed
  currentBattle: Battle | null
  setCurrentBattle: (battle: Battle | null) => void
  
  // Voting state
  isVoting: boolean
  setIsVoting: (voting: boolean) => void
  
  // Selected element for voting
  selectedElement: string | null
  setSelectedElement: (elementId: string | null) => void
  
  // Battle interactions
  likedBattles: Set<string>
  toggleLike: (battleId: string) => void
  
  // Recent votes
  recentVotes: Array<{ battleId: string; elementId: string; timestamp: number }>
  addVote: (battleId: string, elementId: string) => void
  hasVoted: (battleId: string) => boolean
}

export const useBattleStore = create<BattleState>((set, get) => ({
  currentBattle: null,
  setCurrentBattle: (battle) => set({ currentBattle: battle }),
  
  isVoting: false,
  setIsVoting: (voting) => set({ isVoting: voting }),
  
  selectedElement: null,
  setSelectedElement: (elementId) => set({ selectedElement: elementId }),
  
  likedBattles: new Set(),
  toggleLike: (battleId) => {
    set((state) => {
      const newLikedBattles = new Set(state.likedBattles)
      if (newLikedBattles.has(battleId)) {
        newLikedBattles.delete(battleId)
      } else {
        newLikedBattles.add(battleId)
      }
      return { likedBattles: newLikedBattles }
    })
  },
  
  recentVotes: [],
  addVote: (battleId, elementId) => {
    set((state) => ({
      recentVotes: [
        ...state.recentVotes,
        { battleId, elementId, timestamp: Date.now() }
      ].slice(-50) // Keep only last 50 votes
    }))
  },
  
  hasVoted: (battleId) => {
    const { recentVotes } = get()
    return recentVotes.some(vote => vote.battleId === battleId)
  },
}))

// Selectors
export const useCurrentBattle = () => useBattleStore((state) => state.currentBattle)
export const useVotingState = () => useBattleStore((state) => ({
  isVoting: state.isVoting,
  selectedElement: state.selectedElement,
  setIsVoting: state.setIsVoting,
  setSelectedElement: state.setSelectedElement,
}))
export const useBattleLikes = () => useBattleStore((state) => ({
  likedBattles: state.likedBattles,
  toggleLike: state.toggleLike,
}))
```

### 3. React Query Integration

#### Server State with React Query
```ts
// hooks/useBattles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBattleStore } from '@/store/battleStore'
import { useUIStore } from '@/store/uiStore'

export function useBattles() {
  const filters = useUIStore((state) => state.battleFilters)
  
  return useQuery({
    queryKey: ['battles', filters],
    queryFn: () => fetchBattles(filters),
    staleTime: 60_000,
  })
}

export function useBattleVoting() {
  const queryClient = useQueryClient()
  const { setIsVoting, addVote } = useBattleStore()
  
  return useMutation({
    mutationFn: voteBattle,
    onMutate: () => {
      setIsVoting(true)
    },
    onSuccess: (_, variables) => {
      addVote(variables.battleId, variables.elementId)
      queryClient.invalidateQueries({ queryKey: ['battles'] })
    },
    onSettled: () => {
      setIsVoting(false)
    },
  })
}
```

### 4. Form State with React Hook Form

#### Battle Creation Form
```ts
// components/forms/CreateBattleForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUIStore } from '@/store/uiStore'

const CreateBattleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  elements: z.array(z.object({
    name: z.string().min(1, 'Element name is required'),
    media_type: z.enum(['text', 'image', 'audio', 'video', 'document']),
  })).min(2, 'At least 2 elements required').max(10, 'Maximum 10 elements allowed'),
})

type CreateBattleForm = z.infer<typeof CreateBattleSchema>

export function CreateBattleForm() {
  const setCreateBattleModalOpen = useUIStore((state) => state.setCreateBattleModalOpen)
  
  const form = useForm<CreateBattleForm>({
    resolver: zodResolver(CreateBattleSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      elements: [
        { name: '', media_type: 'text' },
        { name: '', media_type: 'text' }
      ]
    }
  })
  
  const { mutate: createBattle, isLoading } = useCreateBattle()
  
  const onSubmit = (data: CreateBattleForm) => {
    createBattle(data, {
      onSuccess: () => {
        form.reset()
        setCreateBattleModalOpen(false)
      }
    })
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 5. State Synchronization Patterns

#### Sync Zustand with React Query
```ts
// hooks/useAuthSync.ts
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

export function useAuthSync() {
  const { data: user, isLoading } = useAuth()
  const { login, logout, setLoading } = useAuthStore()
  
  useEffect(() => {
    setLoading(isLoading)
    
    if (user && !isLoading) {
      login(user, localStorage.getItem('auth_token') || '')
    } else if (!user && !isLoading) {
      logout()
    }
  }, [user, isLoading, login, logout, setLoading])
}
```

#### Optimistic Updates
```ts
// hooks/useOptimisticLike.ts
export function useOptimisticLike() {
  const queryClient = useQueryClient()
  const { toggleLike } = useBattleStore()
  
  return useMutation({
    mutationFn: likeBattle,
    onMutate: (battleId) => {
      // Optimistically update UI
      toggleLike(battleId)
      
      // Cancel outgoing refetches
      queryClient.cancelQueries({ queryKey: ['battles'] })
      
      // Snapshot previous value
      const previousBattles = queryClient.getQueryData(['battles'])
      
      return { previousBattles }
    },
    onError: (err, battleId, context) => {
      // Rollback on error
      if (context?.previousBattles) {
        queryClient.setQueryData(['battles'], context.previousBattles)
      }
      toggleLike(battleId) // Toggle back
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['battles'] })
    },
  })
}
```

### 6. State Persistence

#### Selective Persistence
```ts
// store/persistedStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const usePersistedStore = create<PersistedState>()(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      language: 'en',
      preferences: {},
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
    }),
    {
      name: 'votefight-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        preferences: state.preferences,
      }),
    }
  )
)
```

### 7. State Testing Patterns

#### Store Testing
```ts
// __tests__/store/authStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })
  
  it('should login user', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.login(
        { id: '1', username: 'test', email: 'test@example.com' },
        'token123'
      )
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.username).toBe('test')
  })
  
  it('should logout user', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    act(() => {
      result.current.login(
        { id: '1', username: 'test', email: 'test@example.com' },
        'token123'
      )
    })
    
    // Then logout
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
  })
})
```

### 8. Performance Optimization

#### Memoized Selectors
```ts
// store/selectors.ts
import { useAuthStore } from '@/store/authStore'
import { useMemo } from 'react'

export function useAuthUser() {
  return useAuthStore(useMemo(
    () => (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
    []
  ))
}

export function useAuthActions() {
  return useAuthStore(useMemo(
    () => (state) => ({
      login: state.login,
      logout: state.logout,
      updateUser: state.updateUser,
    }),
    []
  ))
}
```

#### Shallow Equality
```ts
// store/battleStore.ts
import { shallow } from 'zustand/shallow'

export function useBattleState() {
  return useBattleStore(
    (state) => ({
      currentBattle: state.currentBattle,
      isVoting: state.isVoting,
      selectedElement: state.selectedElement,
    }),
    shallow
  )
}
```

### 9. Anti-Patterns to Avoid

#### ❌ Don't Do These:
```ts
// ❌ Storing server data in Zustand
const useBattleStore = create((set) => ({
  battles: [],
  setBattles: (battles) => set({ battles }),
}))

// ❌ Complex nested state
const useComplexStore = create((set) => ({
  user: {
    profile: {
      settings: {
        notifications: {
          email: true,
          push: false,
        }
      }
    }
  }
}))

// ❌ Global state for everything
const useGlobalStore = create((set) => ({
  // Everything in one store
  user: null,
  battles: [],
  ui: {},
  forms: {},
}))

// ❌ No selectors
const Component = () => {
  const store = useAuthStore() // Gets entire store
  return <div>{store.user?.username}</div>
}
```

#### ✅ Do These Instead:
```ts
// ✅ Use React Query for server data
const { data: battles } = useQuery(['battles'], fetchBattles)

// ✅ Flat state structure
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
}))

// ✅ Separate stores by domain
const useAuthStore = create(/* auth logic */)
const useUIStore = create(/* UI logic */)
const useBattleStore = create(/* battle logic */)

// ✅ Use selectors
const Component = () => {
  const user = useAuthStore((state) => state.user)
  return <div>{user?.username}</div>
}
```

### 10. Migration Patterns

#### From useState to Zustand
```ts
// Before: useState
const [theme, setTheme] = useState('light')
const [sidebarOpen, setSidebarOpen] = useState(false)

// After: Zustand
const { theme, setTheme, sidebarOpen, setSidebarOpen } = useUIStore()
```

#### From Context to Zustand
```ts
// Before: Context
const ThemeContext = createContext()
const useTheme = () => useContext(ThemeContext)

// After: Zustand
const useTheme = () => useUIStore((state) => state.theme)
```

---

**Remember**: Use the right tool for the right job. React Query for server state, Zustand for client state, React Hook Form for forms, and local useState for component-specific state.
