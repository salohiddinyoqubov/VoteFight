---
description: VoteFight Import Standards - Always use @/ paths
globs: ["frontend/src/**/*.ts", "frontend/src/**/*.tsx", "frontend/src/**/*.js", "frontend/src/**/*.jsx"]
alwaysApply: true
---

# VoteFight Import Standards

## Import Path Rules

### ✅ ALWAYS Use @/ Paths
```tsx
// ✅ Correct - Use @/ for all imports
import { BattleCard } from '@/components/battles/BattleCard'
import { useAuth } from '@/hooks/useAuth'
import { API_ENDPOINTS } from '@/constants/api'
import { Battle } from '@/types/api'

// ❌ WRONG - Never use relative paths
import { BattleCard } from './BattleCard'
import { BattleCard } from '../battles/BattleCard'
import { BattleCard } from '../../../components/battles/BattleCard'
```

### Path Alias Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Import Organization
```tsx
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// 2. Third-party libraries
import axios from 'axios'
import { toast } from 'react-hot-toast'

// 3. Internal imports (use @/ paths)
import { BattleCard } from '@/components/battles/BattleCard'
import { useAuth } from '@/hooks/useAuth'
import { API_ENDPOINTS } from '@/constants/api'
import { Battle } from '@/types/api'
```

## Anti-Patterns to Avoid

### ❌ Don't Use These:
```tsx
// ❌ Relative imports
import { Component } from './Component'
import { Component } from '../Component'
import { Component } from '../../../Component'

// ❌ Mixed import styles
import { Component } from '@/components/Component'
import { Other } from './Other'
```

### ✅ Always Use These:
```tsx
// ✅ Absolute imports with @/
import { Component } from '@/components/Component'
import { Hook } from '@/hooks/Hook'
import { Type } from '@/types/Type'
import { Constant } from '@/constants/Constant'
```

## File Structure for Imports

```
src/
├── components/
│   ├── ui/
│   ├── battles/
│   ├── users/
│   └── layout/
├── hooks/
├── services/
├── constants/
├── types/
├── utils/
└── store/
```

### Import Examples by Category

#### Components
```tsx
// ✅ Correct
import { Button } from '@/components/ui/Button'
import { BattleCard } from '@/components/battles/BattleCard'
import { UserProfile } from '@/components/users/UserProfile'
import { Header } from '@/components/layout/Header'
```

#### Hooks
```tsx
// ✅ Correct
import { useAuth } from '@/hooks/useAuth'
import { useBattles } from '@/hooks/useBattles'
import { useVoting } from '@/hooks/useVoting'
```

#### Services
```tsx
// ✅ Correct
import { apiClient } from '@/services/apiClient'
import { authService } from '@/services/authService'
```

#### Constants
```tsx
// ✅ Correct
import { API_ENDPOINTS } from '@/constants/api'
import { BATTLE_CATEGORIES } from '@/constants/battleCategories'
```

#### Types
```tsx
// ✅ Correct
import { Battle } from '@/types/api'
import { User } from '@/types/user'
```

#### Utils
```tsx
// ✅ Correct
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
```

## Refactoring Checklist

When updating imports:
1. [ ] Change all `./` to `@/`
2. [ ] Change all `../` to `@/`
3. [ ] Change all `../../../` to `@/`
4. [ ] Verify all imports use `@/` prefix
5. [ ] Test that all imports resolve correctly
6. [ ] Update any barrel exports to use `@/`

## Common Import Patterns

### Component Imports
```tsx
// ✅ Correct
import { BattleCard } from '@/components/battles/BattleCard'
import { UserProfile } from '@/components/users/UserProfile'
import { Header } from '@/components/layout/Header'
```

### Hook Imports
```tsx
// ✅ Correct
import { useAuth } from '@/hooks/useAuth'
import { useBattles } from '@/hooks/useBattles'
import { useVoting } from '@/hooks/useVoting'
```

### Service Imports
```tsx
// ✅ Correct
import { apiClient } from '@/services/apiClient'
import { authService } from '@/services/authService'
```

### Type Imports
```tsx
// ✅ Correct
import { Battle } from '@/types/api'
import { User } from '@/types/user'
import { ApiResponse } from '@/types/api'
```

---

**Remember**: Always use `@/` for internal imports. Never use relative paths like `./`, `../`, or `../../../`.
