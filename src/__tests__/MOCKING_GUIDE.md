# 🎭 Guide de Mocking - CareHealth Frontend

Guide pour mocker les API et dépendances dans les tests.

## 🛠️ MSW (Mock Service Worker)

MSW est configuré pour mocker toutes les requêtes API dans les tests.

### Structure

```
src/__tests__/mocks/
├── server.ts        # Configuration MSW server
└── handlers.ts      # Request handlers
```

### Ajouter un Handler

```typescript
// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/v1/patients', () => {
    return HttpResponse.json({
      status: 'success',
      data: { patients: [...] }
    })
  }),
]
```

### Utiliser dans les Tests

MSW est automatiquement activé dans `setup.ts`. Pas besoin de configuration supplémentaire.

### Override Temporaire

```typescript
import { server } from '@/__tests__/mocks/server'

test('specific test', async () => {
  server.use(
    http.get('/api/v1/patients', () => {
      return HttpResponse.json({ status: 'error' }, { status: 500 })
    })
  )
  
  // Test avec handler override
})
```

## 🎯 Mocking Patterns

### Mock Axios Instance

```typescript
vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))
```

### Mock React Router

```typescript
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})
```

### Mock Zustand Store

```typescript
import { authStore } from '@/store/auth.store'

beforeEach(() => {
  authStore.getState().setAuth({
    user: mockUser,
    accessToken: 'token',
  })
})
```

### Mock React Query

```typescript
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
```

## 📝 Exemples

Voir les tests existants pour plus d'exemples :
- `src/__tests__/unit/hooks/useAuth.test.ts`
- `src/__tests__/unit/services/patients.service.test.ts`

---

**Dernière mise à jour** : Décembre 2024

