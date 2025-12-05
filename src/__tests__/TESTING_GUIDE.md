# 🧪 Guide de Tests - CareHealth Frontend

Guide complet pour écrire, exécuter et maintenir les tests.

## 📋 Structure des Tests

```
src/__tests__/
├── unit/                    # Tests unitaires
│   ├── components/          # Tests composants
│   ├── hooks/               # Tests hooks
│   ├── utils/               # Tests utilitaires
│   └── services/            # Tests services API
├── integration/              # Tests d'intégration
│   ├── auth-flow.test.tsx
│   └── patient-crud.test.tsx
├── e2e/                     # Tests E2E
│   └── specs/
│       ├── auth.spec.ts
│       └── appointments.spec.ts
├── mocks/                   # Mocks MSW
│   ├── server.ts
│   └── handlers.ts
└── setup.ts                # Configuration Jest
```

## 🎯 Types de Tests

### Tests Unitaires

**Objectif** : Tester des composants/fonctions isolés

**Exemple** :
```typescript
import { render, screen } from '@testing-library/react'
import { MedicalCard } from '@/design-system/components/medical'

describe('MedicalCard', () => {
  it('renders title correctly', () => {
    render(<MedicalCard title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Tests d'Intégration

**Objectif** : Tester le flux entre plusieurs composants

**Exemple** :
```typescript
describe('Authentication Flow', () => {
  it('allows user to login', async () => {
    renderWithProviders(<Login />)
    // ... test login flow
  })
})
```

### Tests E2E

**Objectif** : Tester les flux utilisateurs complets

**Exemple** :
```typescript
test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## 🛠️ Commandes

### Tests Unitaires

```bash
# Lancer tous les tests
npm run test

# Mode watch
npm run test:watch

# Avec coverage
npm run test:coverage

# Tests spécifiques
npm run test -- MedicalCard
```

### Tests E2E

```bash
# Lancer Playwright
npx playwright test

# Mode UI
npx playwright test --ui

# Tests spécifiques
npx playwright test auth.spec.ts
```

## 📝 Écrire des Tests

### 1. Structure d'un Test

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup avant chaque test
  })

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### 2. Rendre des Composants

```typescript
import { render, screen } from '@testing-library/react'

const { container } = render(<MyComponent />)
```

### 3. Tester les Interactions

```typescript
import { fireEvent } from '@testing-library/react'

const button = screen.getByRole('button')
fireEvent.click(button)
```

### 4. Tester les Hooks

```typescript
import { renderHook } from '@testing-library/react'

const { result } = renderHook(() => useMyHook())
expect(result.current.value).toBe(expected)
```

### 5. Mocker les API

MSW est configuré automatiquement. Les handlers sont dans `src/__tests__/mocks/handlers.ts`.

## ✅ Bonnes Pratiques

1. **Nommer les tests clairement** : `it('should do X when Y')`

2. **Un test = une assertion principale**

3. **Utiliser les queries accessibles** :
   - `getByRole` (préféré)
   - `getByLabelText`
   - `getByText`
   - Éviter `getByTestId` sauf si nécessaire

4. **Tester le comportement, pas l'implémentation**

5. **Nettoyer après chaque test** (automatique avec `afterEach`)

6. **Mocker les dépendances externes**

## 🎯 Coverage

Objectif : **85%+ coverage**

Vérifier le coverage :
```bash
npm run test:coverage
```

Le rapport est généré dans `coverage/`.

## 🚀 CI/CD

Les tests s'exécutent automatiquement sur :
- Push vers main
- Pull requests

Voir `.github/workflows/test.yml` pour la configuration.

## 📚 Ressources

- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
- [Jest](https://jestjs.io/)

---

**Dernière mise à jour** : Décembre 2024

