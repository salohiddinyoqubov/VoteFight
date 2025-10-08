---
description: VoteFight Frontend Engineering Standards - Next.js Edition
globs: ["frontend/**/*.ts", "frontend/**/*.tsx", "frontend/**/*.js", "frontend/**/*.jsx"]
alwaysApply: true
---

# VoteFight Frontend Engineering Standards (Next.js)

> Version: 1.0  
> Stack: Next.js 14+ + TypeScript + Tailwind + Headless UI + Zustand + React Query + Zod + React Hook Form  
> Goal: Backend standards bilan mos - barqaror, soddalashtirilgan, over-engineering oldini oladigan, istalgan modul uchun yagona frontend talabnomasi.

---
## 0. Core Frontend Principles
| # | Tamoyil | Tavsif | Nega Muhim |
|---|---------|--------|------------|
|1|Single Source of Truth|Konstantalar `src/constants/` da markazlashgan|O'zgarish tez, xatolik kam|
|2|Predictable Data Flow|Server state (React Query), UI state (Zustand), form state (React Hook Form)|Aralashmaslik, debug oson|
|3|Minimal Abstraction|Agar 2 ta joyda ishlatilmasa — abstraksiyaga aylantirma|Kod portlashi oldini oladi|
|4|Declarative UI|Component faqat props -> render|Yon effektlar tarqalmaydi|
|5|Consistency Over Cleverness|Naming, folder, hook/patternlar takroriy|Onboarding tez|
|6|API Contract Stability|Backend envelope formatiga qat'iy mos|Parsing branchlari kamayadi|
|7|Accessible First|Semantik tag + keyboard fokus|Sifat va compliance|
|8|Performance by Intent|Lazy load + memo ONLY profilingdan so'ng|Vaqtni erta optimizatsiyaga sarflamaslik|
|9|Error Visibility|UI da xatoliklar markaziy toast / form field mapping|Foydalanuvchi tajribasi|
|10|Evolution Guardrails|`0A Pragmatik Minimal` + LATER ro'yxati|Scope nazorati|

---
## 0A. Pragmatik Minimal Frontend Standartlar
### 0A.1 MUST HAVE
| Blok | Element | Nega | Mezoni |
|------|---------|------|--------|
|State|Zustand (auth, light UI)|Global server state emas|`/store/*.ts`|
|Server State|React Query|Caching, retry, validation|`QueryClient` rootda|
|Forms|React Hook Form + Zod|Validation + performant|Har forma zod schema|
|API Layer|Bitta `apiClient` + constants|Retry/token/abort markazlashgan|`services/apiClient.ts`|
|Styling|Tailwind + Headless UI|Shablon tezligi|Class reuse|
|Types|TypeScript strict-ish|Runtime xatolar kamayadi|`any` yo'q (istisno: adapter)|
|Error Handling|ErrorBoundary + toast|Foydalanuvchi feedback|Global boundary mavjud|
|Routing|Next.js App Router|SSR/SSG flow|Dynamic routes|
|Auth|Token storage (localStorage) + refresh retry 1x|Session continuity|Interceptors ishlaydi|
|I18n|next-i18next (agar 2+ til kerak bo'lsa)|Matn markazlashuvi|`/locales`|
|Testing|Jest + RTL minimal suite|Regression bazasi|Critical path testlar|
|Accessibility|Focusable + aria label|Asosiy form elementlar|Form label mavjud|
|Env Config|`process.env.*` wrapper|Dev/prod farqlari|`constants/config.ts`|

### 0A.2 LATER (Trigger bo'lsa)
| Element | Trigger | Sabab |
|---------|---------|-------|
|Storybook|UI reuse > 6 modul|Hozircha UI murakkab emas|
|Advanced Theming engine|Multiple brand talab|Bitta brand yetarli|
|State machine (XState)|Kompleks ko'p bosqichli flow|Hozir simple|
|Microfrontends|Bir nechta mustaqil deploy team|Monorepo yetarli|
|SSR/SSG (Next.js)|SEO kritikal / public content|Admin panel fokus|
|Sentry / error tracking|Prod traffic sezilarli|Early stage manual console kifoya|
|Bundle analyzer|Load time shikoyat yoki p95 > threshold|Profiling signalini kutamiz|

### 0A.3 EXCLUDED (Hozir emas)
| Element | Sabab |
|---------|-------|
|Redux Toolkit|React Query + Zustand kombinatsiyasi yetarli|
|MobX / Jotai|State diversifikatsiyasi chalkashlik keltiradi|
|GraphQL Client|REST + axios allaqachon stabil|
|Custom form framework|react-hook-form + zod kifoya|
|CSS-in-JS runtime (styled-components)|Bundle og'irligi + Tailwind mavjud|

### 0A.4 Red Flags
| Belgilar | Amal |
|----------|------|
|Har komponent uchun alohida hook yozish|Reuseni qayd et (>=2 bo'lishi kerak)|
|Abstraksiya faqat "kelajakda kerak bo'ladi" uchun|Yozilmaydi – real signal kutiladi|
|Keraksiz global state|Local component statega qaytar|
|Manual duplicating API baseURL|`buildApiUrl` dan foydalangan|
|Qo'lda fetch + try/catch everywhere|React Query yoki apiClient reuse|

---
## 1. Directory Strukturasi (Next.js)
```
frontend/
  src/
    app/                 # Next.js App Router
    components/          # UI + domain komponentlar
    features/            # O'zaro bog'liq UI + hooks + service (slice-based)
    store/               # Zustand storelar (auth, api states)
    services/            # API client, adapterlar
    constants/           # API_CONFIG, messages, enums, validation
    hooks/               # Reusable composable hooks
    utils/               # Pure helperlar (format, date)
    types/               # Global TypeScript tiplar
    locales/             # i18n resurslar
    errors/              # Custom UI error mapping
    config/              # App init, QueryClient, theme
    __tests__/           # Testlar (component / hook)
```

Qoidalar:
- `features/<name>/` (agar modul 3+ komponent + hook + api chaqiriqqa ega bo'lsa) – kichik bo'lsa `components/` ichida qoladi.
- `utils/` faqat pure (side-effect yo'q) funksiyalar.
- `services/` faqat tarmoq / adapter qatlam (UI yo'q).

---
## 2. Naming Standartlari
| Layer | Pattern | Misol |
|-------|---------|-------|
|Component|PascalCase|`BattleCard`, `UserProfile`|
|Hook|`use` prefix|`useAuth`, `usePaginatedQuery`|
|Store file|`<domain>Store.ts`|`authStore.ts`|
|Constants|SCREAMING_SNAKE_CASE|`API_CONFIG`, `ERROR_MESSAGES`|
|Test file|`<Component>.test.tsx`|`BattleCard.test.tsx`|
|Feature folder|kebab-case|`battle-creation`, `user-profile`|
|Types|PascalCase|`Battle`, `ApiEnvelope<T>`|
|Zod schema|PascalCase + Schema|`BattleCreateSchema`|

---
## 3. API Layer (Axios Only - NO React Query)
Principles:
- **ONLY Axios** for all API calls - no React Query, SWR, or other libraries
- **NO WebSocket** - use 5-minute polling for updates
- **ALL imports** must use `@/` paths - no relative paths
- Service functions for API calls
- 5-minute polling for statistics updates

Axios Hook Skeleton:
```ts
export function useBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchBattles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/battles/')
      setBattles(response.data.data)
    } catch (error) {
      handleApiError(error)
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
  
  return { battles, loading, refetch: fetchBattles }
}
```
Service Function Skeleton:
```ts
export const battleService = {
  async getBattles(): Promise<Battle[]> {
    const response = await apiClient.get('/battles/')
    return response.data.data
  },
  
  async createBattle(data: CreateBattleRequest): Promise<Battle> {
    const response = await apiClient.post('/battles/', data)
    return response.data.data
  }
}
```
Anti-pattern: React Query, SWR, WebSocket – o'rniga Axios + polling.

---
## 4. Auth & Session
| Element | Qoida |
|---------|-------|
|Token saqlash|`localStorage` (kelajak: httpOnly cookie baholash)|
|Auto attach header|Interceptor (clientda)|
|401 handling|Refresh 1 marta, so'ng logout|
|User state|`authStore` da|
|Protected route|`<ProtectedRoute/>` komponenti|
|Logout|Tokenlarni tozalash + redirect|

---
## 5. Formlar (React Hook Form + Zod)
Pattern:
```ts
const form = useForm<z.infer<typeof BattleCreateSchema>>({
  resolver: zodResolver(BattleCreateSchema),
  defaultValues: { title: '', description: '' }
})
```
Qoidalar:
- Har forma: zod schema + resolver.
- Error mapping: `formState.errors[field]?.message`.
- Submit: async call + success toast + reset (zarur bo'lsa).
- Anti-pattern: controlled inputni qo'lda state bilan boshqarish (register ishlatish kerak).

---
## 6. UI Komponent Layer
| Kategoriya | Qoida |
|------------|-------|
|Atomic|Button/Input/Select – `components/ui/`|
|Compound|BattleCard, UserProfile – `components/<domain>/`|
|Layout|`components/layout/` – container, header|
|Domain Feature|Agar 3+ file – `features/<domain>/`|

Styling Qoidalar:
- Tailwind class tartibi: grouping (layout → spacing → color → state).
- Repeated class 3+ marta → `cn()` + variant (class-variance-authority) pattern.

---
## 7. Error & Loading Handling
| Holat | Pattern |
|-------|---------|
|Global error|`<ErrorBoundary>` wrap root|
|API loading|React Query `isLoading` yoki custom event |
|Form submit|Button disabled + spinner|
|Table skeleton|Conditional render: skeleton component|
|Toast|Success/error feedback (central util)|

Backend envelope bilan mos mapping (adapter mumkin):
```ts
if (resp.status === 'error') showToast(resp.message)
else setData(resp.data)
```

---
## 8. State Management Qoidalari
| Nima | Joy | Qoida |
|------|-----|-------|
|Server data|React Query|Cache invalidation kerak bo'lsa shu yer|
|Auth/User|Zustand|Session continuity|
|Ephemeral UI|Local component state|Modal open/close|
|Cross-cut ephemeral|Zustand (agar 2+ page)|Theme, drawer|
|Derived data|Memo / selector|Keraksiz recalculation yo'q|

Anti-pattern: Server data'ni Zustandga ko'chirib qo'yish.

---
## 9. Testing (Jest + React Testing Library)
| Test Turi | Minimal | Maqsad |
|-----------|---------|--------|
|Component (presentational)|Render + props variant | UI regression |
|Hook (data)|React Query integration | Cache invalidate ishonchi |
|Auth flow|Login success + 401 refresh fail | Session ishlashi |
|Form|Validation xato + success submit | Schema mapping |
|Battle list|Pagination meta ko'rsatadi | Envelope moslik |

Patterns:
```ts
it('shows validation error', async () => {
 render(<BattleForm />)
 user.type(screen.getByLabelText(/Title/i), '')
 user.click(screen.getByRole('button', {name:/create/i}))
 expect(await screen.findByText(/required/i)).toBeInTheDocument()
})
```

---
## 10. Performance Minimal
| Holat | Qoida |
|-------|-------|
|Large route|Dynamic import (lazy)|
|Heavy list|Virtualization faqat lag bo'lsa|
|Re-render sabab|Devtools bilan track|
|Memoization|Faqat profiling ko'rsatganda|

Checklist: initial load < 3s (dev), interactivity < 5s — manual kuzatish.

---
## 11. Accessibility (A11y)
| Element | Qoida |
|---------|-------|
|Form|`<label htmlFor>` + input id majburiy|
|Interactive|`button` o'rniga `div onClick` YASOQLANMAYDI|
|Focus|Modal ochilganda fokus birinchi interaktiv elementga|
|Color kontrast|Tailwind ranglari accessible variant|

---
## 12. I18n (VoteFight Multilingual)
- Matnlar `locales/<lang>/*.json` – komponent ichida literal string yo'q (istisno: dev placeholder).
- Fallback til: `UZ` yoki `EN` – bittasini tanla.
- Dinamik formatlar (sana/son) – `date-fns` + locale.

---
## 13. Security (Base Frontend)
| Risk | Qarshi chora |
|------|--------------|
|XSS|Dangerous HTML injection yo'q (innerHTML ishlatma)|
|Token leak|Token faqat localStorage + https (prod)|
|Open redirect|`window.location =` faqat oq ro'yxat|
|Sensitive log|Token/xususiy ma'lumot console.ga chiqmaydi|
|Form duplication submit|Disable while submitting|

---
## 14. Anti-Patternlar (Bloklanadi)
| Noto'g'ri | Sabab | To'g'ri |
|----------|-------|--------|
|Inline "magic" string endpoint|Konsistensiya yo'q|`buildApiUrl(API_ENDPOINTS.BATTLES)`|
|Har komponentda manual fetch|Kod duplication|Hook (useQuery)|
|`any` ishlatish|Type xavfsizligi yo'q|Aniq interface / zod inference|
|Katta monolit component (>300 LOC)|Qayta foydalanish yo'q|Split: UI / container|
|useEffect + setState fetch|Race conditions|React Query|
|Custom global event bus|Murakkablik + debug og'ir|Zustand/store|

---
## 15. PR Review Checklist (Frontend)
- [ ] Endpoint hardcode yo'q
- [ ] Component nomi semantik
- [ ] Form zod schema bilan
- [ ] React Query ishlatilgan (manual fetch emas)
- [ ] Error/Loading UI bor
- [ ] Token refresh flow buzilmagan
- [ ] `any` ishlatilmagan (asosli bo'lmasa)
- [ ] Styles duplicate emas (3+ marta takror -> refactor)
- [ ] Testlar (kamida 1 happy + 1 error) qo'shilgan
- [ ] Feature scope haddan tashqari emas

---
## 16. Module (Feature) Qo'shish Ketma-ketligi
1. Endpoint constants (agar yangi)  
2. Types (API response mapping)  
3. Zod schema (forma bo'lsa)  
4. Query hook (`useBattleList`, `useCreateBattle`)  
5. Components (UI + container)  
6. Testlar (render + error)  
7. Route qo'shish  
8. Docs (README bo'limiga 1 qator)  

---
## 17. Next.js Specific Conventions
### 17.1 App Router Structure
```
app/
  layout.tsx              # Root layout
  page.tsx                # Home page
  battles/
    [id]/
      page.tsx            # Battle detail
  @[username]/
    page.tsx              # User profile
  globals.css             # Global styles
```

### 17.2 Server vs Client Components
| Holat | Qoida |
|-------|-------|
|Data fetching|Server Component (SEO)|
|Interactive UI|Client Component ('use client')|
|Forms|Client Component|
|Static content|Server Component|

### 17.3 Metadata & SEO
```ts
export const metadata: Metadata = {
  title: 'Battle Title - VoteFight',
  description: 'Vote on this battle and see real-time results',
}
```

---
## 18. VoteFight Specific Patterns
### 18.1 Battle Components
- `BattleCard` - List view
- `BattleDetail` - Full view with voting
- `CreateBattleModal` - Form modal
- `RichMediaElement` - Media player

### 18.2 User Profile System
- `@username` routing
- Profile tabs (battles, following, followers)
- Social features (follow, like, share)

### 18.3 Trending System
- `TrendingSection` - Global trending
- `PersonalizedSection` - User recommendations
- `CategorySection` - Category-based
- `QuickPicksSection` - Fast voting

---
## 19. Quick Start
```bash
npm install
npm run dev
# Test
npm test
```

---
## 20. Kelgusida Qo'shilishi Mumkin (Faol Kuzatish)
| Element | Kuzatish mezoni |
|---------|-----------------|
|Error tracking (Sentry)|Prod xato foydalanuvchi shikoyatlari| 
|Bundle optimization|Chunk > 500KB yoki initial load sekin|
|Skeleton system unifikatsiyasi|Ko'p joyda duplikatsiya| 
|MSW (API mocking)|Backend kechiktirilgan integratsiya|

---
**Tayyor.** Ushbu guide VoteFight Next.js loyihasi uchun backend standartlari bilan mos ravishda frontendni boshqariladigan, ortiqcha murakkab emas, lekin professional tutadi.
