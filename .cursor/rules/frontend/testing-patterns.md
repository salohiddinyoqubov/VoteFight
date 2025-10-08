---
description: VoteFight Testing Patterns and Standards
globs: ["frontend/src/**/*.test.ts", "frontend/src/**/*.test.tsx", "frontend/src/__tests__/**/*"]
alwaysApply: true
---

# VoteFight Testing Patterns

## Testing Strategy

### 1. Testing Pyramid

| Test Type | Coverage | Tools | Purpose |
|-----------|----------|-------|---------|
| Unit Tests | 70% | Jest + RTL | Component logic, hooks, utils |
| Integration Tests | 20% | Jest + RTL + MSW | API integration, user flows |
| E2E Tests | 10% | Playwright | Critical user journeys |

### 2. Testing Tools Setup

```json
// package.json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@types/jest": "^29.0.0",
    "msw": "^2.0.0"
  }
}
```

```js
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

```js
// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './src/mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
```

## Component Testing Patterns

### 1. Basic Component Tests

```tsx
// __tests__/components/BattleCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BattleCard } from '@/components/battles/BattleCard'
import { mockBattle } from '@/mocks/data'

describe('BattleCard', () => {
  const mockOnVote = jest.fn()
  
  beforeEach(() => {
    mockOnVote.mockClear()
  })
  
  it('renders battle title and description', () => {
    render(<BattleCard battle={mockBattle} onVote={mockOnVote} />)
    
    expect(screen.getByText(mockBattle.title)).toBeInTheDocument()
    expect(screen.getByText(mockBattle.description)).toBeInTheDocument()
  })
  
  it('renders all battle elements', () => {
    render(<BattleCard battle={mockBattle} onVote={mockOnVote} />)
    
    mockBattle.elements.forEach(element => {
      expect(screen.getByText(element.name)).toBeInTheDocument()
    })
  })
  
  it('calls onVote when element is clicked', async () => {
    const user = userEvent.setup()
    render(<BattleCard battle={mockBattle} onVote={mockOnVote} />)
    
    const firstElement = screen.getByText(mockBattle.elements[0].name)
    await user.click(firstElement)
    
    expect(mockOnVote).toHaveBeenCalledWith(
      mockBattle.id,
      mockBattle.elements[0].id
    )
  })
  
  it('shows vote percentages correctly', () => {
    render(<BattleCard battle={mockBattle} onVote={mockOnVote} />)
    
    mockBattle.elements.forEach(element => {
      expect(screen.getByText(`${element.percentage}%`)).toBeInTheDocument()
    })
  })
})
```

### 2. Form Testing

```tsx
// __tests__/components/CreateBattleForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateBattleForm } from '@/components/forms/CreateBattleForm'

describe('CreateBattleForm', () => {
  it('renders form fields', () => {
    render(<CreateBattleForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
  })
  
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<CreateBattleForm />)
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)
    
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/category is required/i)).toBeInTheDocument()
  })
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<CreateBattleForm />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Battle')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/category/i), 'technology')
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/battle created/i)).toBeInTheDocument()
    })
  })
})
```

### 3. Hook Testing

```tsx
// __tests__/hooks/useBattles.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBattles } from '@/hooks/useBattles'
import { server } from '@/mocks/server'
import { rest } from 'msw'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useBattles', () => {
  it('fetches battles successfully', async () => {
    const { result } = renderHook(() => useBattles(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].title).toBe('Test Battle 1')
  })
  
  it('handles API errors', async () => {
    server.use(
      rest.get('/api/battles', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server Error' }))
      })
    )
    
    const { result } = renderHook(() => useBattles(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    
    expect(result.current.error).toBeDefined()
  })
})
```

### 4. Store Testing

```tsx
// __tests__/store/authStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })
  
  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBe(null)
  })
  
  it('should login user', () => {
    const { result } = renderHook(() => useAuthStore())
    
    const user = { id: '1', username: 'test', email: 'test@example.com' }
    const token = 'token123'
    
    act(() => {
      result.current.login(user, token)
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(user)
    expect(result.current.token).toBe(token)
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
    expect(result.current.token).toBe(null)
  })
})
```

## API Testing with MSW

### 1. Mock Server Setup

```ts
// mocks/server.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { mockBattles, mockUsers } from './data'

export const handlers = [
  // Battles
  rest.get('/api/battles', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1'
    const category = req.url.searchParams.get('category')
    
    let filteredBattles = mockBattles
    if (category) {
      filteredBattles = mockBattles.filter(battle => battle.category === category)
    }
    
    return res(
      ctx.json({
        success: true,
        data: filteredBattles,
        meta: {
          pagination: {
            page: parseInt(page),
            per_page: 20,
            total: filteredBattles.length,
            pages: Math.ceil(filteredBattles.length / 20)
          }
        }
      })
    )
  }),
  
  rest.get('/api/battles/:id', (req, res, ctx) => {
    const { id } = req.params
    const battle = mockBattles.find(b => b.id === id)
    
    if (!battle) {
      return res(ctx.status(404), ctx.json({ error: 'Battle not found' }))
    }
    
    return res(ctx.json({
      success: true,
      data: battle
    }))
  }),
  
  rest.post('/api/battles/:id/vote', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'Vote submitted successfully'
    }))
  }),
  
  // Auth
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        user: mockUsers[0],
        token: 'mock-jwt-token'
      }
    }))
  }),
]

export const server = setupServer(...handlers)
```

### 2. Mock Data

```ts
// mocks/data.ts
export const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    avatar_url: null,
    bio: 'Test user bio',
    battles_count: 5,
    followers_count: 10,
    following_count: 8,
    total_votes_received: 50,
    created_at: '2024-01-01T00:00:00Z'
  }
]

export const mockBattles = [
  {
    id: '1',
    title: 'iPhone vs Samsung',
    description: 'Which phone is better?',
    category: 'technology',
    total_votes: 100,
    elements: [
      {
        id: '1',
        name: 'iPhone',
        media_type: 'text',
        vote_count: 60,
        percentage: 60
      },
      {
        id: '2',
        name: 'Samsung',
        media_type: 'text',
        vote_count: 40,
        percentage: 40
      }
    ],
    creator: mockUsers[0],
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
    trending_score: 85.5
  }
]
```

### 3. Integration Tests

```tsx
// __tests__/integration/BattleFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BattleDetailPage } from '@/components/pages/BattleDetailPage'
import { server } from '@/mocks/server'
import { rest } from 'msw'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Battle Flow Integration', () => {
  it('allows user to vote on battle', async () => {
    const user = userEvent.setup()
    
    render(<BattleDetailPage battleId="1" />, {
      wrapper: createWrapper(),
    })
    
    // Wait for battle to load
    await waitFor(() => {
      expect(screen.getByText('iPhone vs Samsung')).toBeInTheDocument()
    })
    
    // Click on first element to vote
    const firstElement = screen.getByText('iPhone')
    await user.click(firstElement)
    
    // Click vote button
    const voteButton = screen.getByRole('button', { name: /vote now/i })
    await user.click(voteButton)
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/vote submitted/i)).toBeInTheDocument()
    })
  })
  
  it('handles vote errors gracefully', async () => {
    server.use(
      rest.post('/api/battles/1/vote', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'Already voted' }))
      })
    )
    
    const user = userEvent.setup()
    
    render(<BattleDetailPage battleId="1" />, {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(screen.getByText('iPhone vs Samsung')).toBeInTheDocument()
    })
    
    const firstElement = screen.getByText('iPhone')
    await user.click(firstElement)
    
    const voteButton = screen.getByRole('button', { name: /vote now/i })
    await user.click(voteButton)
    
    await waitFor(() => {
      expect(screen.getByText(/already voted/i)).toBeInTheDocument()
    })
  })
})
```

## Accessibility Testing

### 1. A11y Testing

```tsx
// __tests__/accessibility/BattleCard.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BattleCard } from '@/components/battles/BattleCard'
import { mockBattle } from '@/mocks/data'

expect.extend(toHaveNoViolations)

describe('BattleCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<BattleCard battle={mockBattle} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('should have proper ARIA labels', () => {
    render(<BattleCard battle={mockBattle} />)
    
    expect(screen.getByRole('button', { name: /vote for iphone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vote for samsung/i })).toBeInTheDocument()
  })
  
  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(<BattleCard battle={mockBattle} />)
    
    const firstElement = screen.getByRole('button', { name: /vote for iphone/i })
    firstElement.focus()
    
    expect(firstElement).toHaveFocus()
    
    await user.keyboard('{Enter}')
    // Test keyboard interaction
  })
})
```

## Performance Testing

### 1. Component Performance

```tsx
// __tests__/performance/BattleList.test.tsx
import { render } from '@testing-library/react'
import { BattleList } from '@/components/battles/BattleList'
import { mockBattles } from '@/mocks/data'

describe('BattleList Performance', () => {
  it('renders large list efficiently', () => {
    const largeBattleList = Array(100).fill(null).map((_, i) => ({
      ...mockBattles[0],
      id: i.toString(),
      title: `Battle ${i}`
    }))
    
    const start = performance.now()
    render(<BattleList battles={largeBattleList} />)
    const end = performance.now()
    
    // Should render in less than 100ms
    expect(end - start).toBeLessThan(100)
  })
})
```

## Testing Utilities

### 1. Custom Render Function

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    user: any
    isAuthenticated: boolean
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialAuthState, ...renderOptions }: CustomRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  // Set initial auth state
  if (initialAuthState) {
    useAuthStore.setState(initialAuthState)
  }
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
```

### 2. Test Data Factories

```tsx
// test-utils/factories.ts
import { faker } from '@faker-js/faker'

export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  avatar_url: faker.image.avatar(),
  bio: faker.lorem.sentence(),
  battles_count: faker.number.int({ min: 0, max: 100 }),
  followers_count: faker.number.int({ min: 0, max: 1000 }),
  following_count: faker.number.int({ min: 0, max: 500 }),
  total_votes_received: faker.number.int({ min: 0, max: 10000 }),
  created_at: faker.date.past().toISOString(),
  ...overrides
})

export const createMockBattle = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(['technology', 'food', 'entertainment']),
  total_votes: faker.number.int({ min: 0, max: 1000 }),
  elements: Array.from({ length: 2 }, (_, i) => ({
    id: faker.string.uuid(),
    name: faker.lorem.word(),
    media_type: 'text' as const,
    vote_count: faker.number.int({ min: 0, max: 500 }),
    percentage: faker.number.float({ min: 0, max: 100, fractionDigits: 1 })
  })),
  creator: createMockUser(),
  created_at: faker.date.past().toISOString(),
  is_active: true,
  trending_score: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
  ...overrides
})
```

## Testing Best Practices

### 1. Test Organization

```
__tests__/
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   └── Input.test.tsx
│   ├── battles/
│   │   ├── BattleCard.test.tsx
│   │   └── BattleDetail.test.tsx
│   └── forms/
│       └── CreateBattleForm.test.tsx
├── hooks/
│   ├── useBattles.test.ts
│   └── useAuth.test.ts
├── store/
│   ├── authStore.test.ts
│   └── uiStore.test.ts
├── integration/
│   ├── BattleFlow.test.tsx
│   └── AuthFlow.test.tsx
└── accessibility/
    └── BattleCard.test.tsx
```

### 2. Test Naming Conventions

```tsx
// ✅ Good - Descriptive test names
describe('BattleCard', () => {
  it('renders battle title and description')
  it('calls onVote when element is clicked')
  it('shows vote percentages correctly')
  it('handles empty elements array gracefully')
})

// ❌ Bad - Vague test names
describe('BattleCard', () => {
  it('works')
  it('renders')
  it('handles click')
})
```

### 3. Test Data Management

```tsx
// ✅ Good - Use factories for test data
const mockBattle = createMockBattle({
  title: 'Test Battle',
  elements: [
    { name: 'Option 1', vote_count: 60, percentage: 60 },
    { name: 'Option 2', vote_count: 40, percentage: 40 }
  ]
})

// ❌ Bad - Hardcoded test data
const mockBattle = {
  id: '1',
  title: 'Test Battle',
  // ... lots of hardcoded data
}
```

### 4. Async Testing

```tsx
// ✅ Good - Proper async testing
it('loads battles on mount', async () => {
  render(<BattleList />)
  
  await waitFor(() => {
    expect(screen.getByText('Battle 1')).toBeInTheDocument()
  })
})

// ❌ Bad - Incorrect async handling
it('loads battles on mount', () => {
  render(<BattleList />)
  expect(screen.getByText('Battle 1')).toBeInTheDocument() // Will fail
})
```

---

**Remember**: Write tests that test behavior, not implementation. Focus on what the user sees and does, not how the code works internally.
