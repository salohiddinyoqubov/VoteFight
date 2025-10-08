---
description: VoteFight Component Patterns and Standards
globs: ["frontend/src/components/**/*.tsx", "frontend/src/features/**/*.tsx"]
alwaysApply: true
---

# VoteFight Component Patterns

## Component Structure Standards

### 1. Component File Structure
```tsx
// components/battles/BattleCard.tsx
'use client'

import { useState } from 'react'
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { cn } from '@/utils/cn'

interface BattleCardProps {
  battle: Battle
  onVote?: (battleId: string, elementId: string) => void
  className?: string
}

export function BattleCard({ battle, onVote, className }: BattleCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  
  return (
    <div className={cn("bg-white rounded-lg shadow-md", className)}>
      {/* Component content */}
    </div>
  )
}
```

### 2. Naming Conventions
- **Components**: PascalCase (`BattleCard`, `UserProfile`)
- **Props**: camelCase (`battleId`, `onVote`)
- **Props Interface**: `{ComponentName}Props`
- **Event Handlers**: `on{Action}` (`onVote`, `onLike`, `onShare`)

### 3. Props Patterns
```tsx
// ✅ Good - Explicit props
interface BattleCardProps {
  battle: Battle
  onVote?: (battleId: string, elementId: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

// ❌ Bad - Generic props
interface BattleCardProps {
  data: any
  onClick?: () => void
}
```

### 4. Component Categories

#### Atomic Components (`components/ui/`)
```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({ variant, size, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md font-medium transition-colors",
        {
          "bg-red-600 text-white hover:bg-red-700": variant === 'primary',
          "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === 'secondary',
          "bg-red-600 text-white hover:bg-red-700": variant === 'danger',
        },
        {
          "px-3 py-1.5 text-sm": size === 'sm',
          "px-4 py-2 text-base": size === 'md',
          "px-6 py-3 text-lg": size === 'lg',
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

#### Domain Components (`components/battles/`, `components/users/`)
```tsx
// components/battles/BattleCard.tsx
export function BattleCard({ battle, onVote }: BattleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold">{battle.title}</h3>
      <div className="mt-4 space-y-2">
        {battle.elements.map(element => (
          <button
            key={element.id}
            onClick={() => onVote?.(battle.id, element.id)}
            className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
          >
            {element.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

#### Layout Components (`components/layout/`)
```tsx
// components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-red-600">VoteFight</h1>
          <nav className="flex space-x-8">
            {/* Navigation items */}
          </nav>
        </div>
      </div>
    </header>
  )
}
```

### 5. Styling Standards

#### Tailwind Class Organization
```tsx
// ✅ Good - Organized classes
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 mb-6",
  // Colors
  "bg-white text-gray-900",
  // States
  "hover:bg-gray-50 focus:ring-2 focus:ring-red-500",
  // Responsive
  "sm:flex-col md:flex-row",
  // Conditional
  isActive && "bg-red-50 border-red-200"
)}>
```

#### Class Variance Authority Pattern
```tsx
// utils/cn.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// components/ui/Button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-red-600 text-white hover:bg-red-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)
```

### 6. State Management in Components

#### Local State (useState)
```tsx
// ✅ Good - Simple local state
export function BattleCard({ battle }: BattleCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async (elementId: string) => {
    setIsVoting(true)
    try {
      await voteBattle(battle.id, elementId)
    } finally {
      setIsVoting(false)
    }
  }
  
  return (
    // Component JSX
  )
}
```

#### Global State (Zustand)
```tsx
// store/authStore.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

// components/UserMenu.tsx
export function UserMenu() {
  const { user, logout } = useAuthStore()
  
  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </div>
  )
}
```

### 7. Event Handling Patterns

#### Click Handlers
```tsx
// ✅ Good - Specific handlers
export function BattleCard({ battle, onVote }: BattleCardProps) {
  const handleVote = (elementId: string) => {
    onVote?.(battle.id, elementId)
  }
  
  const handleLike = () => {
    // Like logic
  }
  
  return (
    <div>
      <button onClick={() => handleVote(element.id)}>Vote</button>
      <button onClick={handleLike}>Like</button>
    </div>
  )
}

// ❌ Bad - Generic handlers
export function BattleCard({ battle, onClick }: BattleCardProps) {
  return (
    <div onClick={onClick}>
      {/* Content */}
    </div>
  )
}
```

### 8. Loading and Error States

#### Loading States
```tsx
export function BattleCard({ battle }: BattleCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  
  if (isVoting) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    // Normal component
  )
}
```

#### Error Boundaries
```tsx
// components/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

export function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return Fallback ? <Fallback error={error} /> : (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-semibold">Something went wrong</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    )
  }
  
  return <>{children}</>
}
```

### 9. Accessibility Standards

#### Form Labels
```tsx
// ✅ Good - Proper labels
export function CreateBattleForm() {
  return (
    <form>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Battle Title
        </label>
        <input
          id="title"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </form>
  )
}

// ❌ Bad - Missing labels
export function CreateBattleForm() {
  return (
    <form>
      <input type="text" placeholder="Battle Title" />
    </form>
  )
}
```

#### Interactive Elements
```tsx
// ✅ Good - Semantic buttons
<button
  onClick={handleVote}
  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
  disabled={isVoting}
  aria-label={`Vote for ${element.name}`}
>
  {isVoting ? 'Voting...' : 'Vote'}
</button>

// ❌ Bad - Non-semantic divs
<div
  onClick={handleVote}
  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
>
  Vote
</div>
```

### 10. Component Composition

#### Compound Components
```tsx
// components/battles/BattleCard.tsx
export function BattleCard({ battle }: BattleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <BattleCard.Header battle={battle} />
      <BattleCard.Elements elements={battle.elements} />
      <BattleCard.Actions battle={battle} />
    </div>
  )
}

BattleCard.Header = function BattleCardHeader({ battle }: { battle: Battle }) {
  return (
    <div className="p-4 border-b">
      <h3 className="text-lg font-semibold">{battle.title}</h3>
    </div>
  )
}

BattleCard.Elements = function BattleCardElements({ elements }: { elements: Element[] }) {
  return (
    <div className="p-4 space-y-2">
      {elements.map(element => (
        <div key={element.id} className="p-2 border rounded">
          {element.name}
        </div>
      ))}
    </div>
  )
}

BattleCard.Actions = function BattleCardActions({ battle }: { battle: Battle }) {
  return (
    <div className="p-4 border-t flex space-x-2">
      <button>Like</button>
      <button>Share</button>
      <button>Vote</button>
    </div>
  )
}
```

### 11. Performance Patterns

#### Memoization (Only when needed)
```tsx
// ✅ Good - Memoized expensive component
export const BattleCard = memo(function BattleCard({ battle }: BattleCardProps) {
  const handleVote = useCallback((elementId: string) => {
    // Vote logic
  }, [battle.id])
  
  return (
    // Component JSX
  )
})

// ❌ Bad - Unnecessary memoization
export const BattleCard = memo(function BattleCard({ battle }: BattleCardProps) {
  return (
    <div>{battle.title}</div>
  )
})
```

#### Lazy Loading
```tsx
// components/lazy/BattleDetail.tsx
import { lazy, Suspense } from 'react'

const BattleDetail = lazy(() => import('./BattleDetail'))

export function BattleDetailWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BattleDetail />
    </Suspense>
  )
}
```

### 12. Testing Patterns

#### Component Tests
```tsx
// __tests__/BattleCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BattleCard } from '../components/battles/BattleCard'

const mockBattle = {
  id: '1',
  title: 'Test Battle',
  elements: [
    { id: '1', name: 'Option 1' },
    { id: '2', name: 'Option 2' }
  ]
}

describe('BattleCard', () => {
  it('renders battle title', () => {
    render(<BattleCard battle={mockBattle} />)
    expect(screen.getByText('Test Battle')).toBeInTheDocument()
  })
  
  it('calls onVote when element is clicked', () => {
    const onVote = jest.fn()
    render(<BattleCard battle={mockBattle} onVote={onVote} />)
    
    fireEvent.click(screen.getByText('Option 1'))
    expect(onVote).toHaveBeenCalledWith('1', '1')
  })
})
```

### 13. Anti-Patterns to Avoid

#### ❌ Don't Do These:
```tsx
// ❌ Inline styles
<div style={{ color: 'red', fontSize: '16px' }}>

// ❌ Magic strings
<button onClick={() => handleAction('magic_string')}>

// ❌ Large components (>300 LOC)
export function MegaComponent() {
  // 500+ lines of code
}

// ❌ Props drilling
<ComponentA>
  <ComponentB>
    <ComponentC>
      <ComponentD prop={deepProp} />
    </ComponentC>
  </ComponentB>
</ComponentA>

// ❌ useEffect for data fetching
useEffect(() => {
  fetch('/api/battles').then(setBattles)
}, [])
```

#### ✅ Do These Instead:
```tsx
// ✅ Tailwind classes
<div className="text-red-600 text-base">

// ✅ Constants
<button onClick={() => handleAction(ACTIONS.VOTE)}>

// ✅ Split components
export function BattleCard() { /* 50 lines */ }
export function BattleActions() { /* 30 lines */ }

// ✅ Context or state management
const { battles } = useBattles()

// ✅ React Query
const { data: battles } = useQuery(['battles'], fetchBattles)
```

---

**Remember**: Keep components simple, focused, and reusable. Follow the single responsibility principle and use proper TypeScript typing.
