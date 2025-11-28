# 🧪 Plan d'Augmentation de la Couverture de Tests

## Date: 2024

---

## 📊 État Actuel

- **Coverage Actuel**: ~5%
- **Coverage Cible**: 70% minimum
- **Tests Existants**: 1 fichier (`auth.test.ts` - basique)

---

## 🎯 Objectifs

1. Atteindre 70% de couverture globale
2. 80%+ pour les utilitaires critiques
3. 60%+ pour les composants UI
4. 70%+ pour les hooks
5. 80%+ pour les stores

---

## 📋 Plan de Tests par Catégorie

### 1. Utilitaires (Priority: HAUTE)

#### `src/utils/logger.ts`
- ✅ Logger en dev mode
- ✅ Pas de logs en prod (sauf errors)
- ✅ Format correct
- ✅ Niveaux (debug, info, warn, error)
- **Target**: 90%

#### `src/utils/helpers.ts`
- ✅ formatDate
- ✅ formatDateTime
- ✅ formatPhoneNumber
- ✅ debounce
- ✅ capitalize
- ✅ getUserInitials
- ✅ isEmpty
- **Target**: 85%

#### `src/utils/role-based-access.ts`
- ✅ hasRouteAccess (tous cas)
- ✅ getAccessibleRoutes
- ✅ hasRole
- ✅ isAdmin
- ✅ isMedicalStaff
- **Target**: 90%

---

### 2. Stores Zustand (Priority: HAUTE)

#### `src/store/auth.store.ts`
- ✅ setAuth (mise à jour state)
- ✅ clearAuth (nettoyage)
- ✅ logout (API call + cleanup)
- ✅ getAccessToken
- ✅ getRefreshToken
- ✅ getUser
- ✅ Persistence (localStorage)
- **Target**: 85%

#### `src/store/user.store.ts`
- ✅ Si utilisé: tests complets
- ✅ Si non utilisé: supprimer ou documenter
- **Target**: N/A ou 80%

---

### 3. Hooks (Priority: HAUTE)

#### `src/hooks/useAuth.ts`
- ✅ État initial
- ✅ Login mutation (success, error)
- ✅ Register mutation (success, error)
- ✅ Logout mutation
- ✅ refreshAccessToken
- ✅ Navigation après actions
- **Target**: 80%

#### `src/hooks/useApiError.ts` (à créer)
- ✅ Extraction message erreur
- ✅ Formatage cohérent
- **Target**: 75%

---

### 4. Composants UI (Priority: MOYENNE)

#### `src/components/ui/button.tsx`
- ✅ Rendu de base
- ✅ Tous les variants
- ✅ Toutes les sizes
- ✅ Disabled state
- ✅ Events handlers
- **Target**: 80%

#### `src/components/ui/card.tsx` (à créer)
- ✅ Rendu de base
- ✅ Variants
- **Target**: 70%

#### `src/components/ui/input.tsx` (à créer)
- ✅ Rendu de base
- ✅ États (error, disabled)
- ✅ Events
- **Target**: 75%

---

### 5. Composants Layout (Priority: MOYENNE)

#### `src/components/ErrorBoundary.tsx`
- ✅ Capture erreurs React
- ✅ Affiche fallback UI
- ✅ Logging erreurs
- ✅ Bouton reload
- **Target**: 85%

#### `src/layouts/AuthLayout.tsx`
- ✅ Rendu de base
- ✅ Structure correcte
- **Target**: 60%

#### `src/layouts/DashboardLayout.tsx`
- ✅ Rendu de base
- ✅ Navigation filtrée par rôle
- ✅ Sidebar mobile
- ✅ Logout
- **Target**: 70%

#### `src/components/layouts/PageLayout.tsx` (à créer)
- ✅ Rendu de base
- ✅ Props optionnelles
- **Target**: 70%

#### `src/components/layouts/DetailPage.tsx` (à créer)
- ✅ Rendu de base
- ✅ Back button
- **Target**: 70%

---

### 6. Routing (Priority: HAUTE)

#### `src/router/protected-route.tsx`
- ✅ Redirection si non authentifié
- ✅ Redirection si rôle non autorisé
- ✅ Accès si authentifié et autorisé
- ✅ Navigation state préservée
- **Target**: 85%

---

### 7. API & Services (Priority: MOYENNE)

#### `src/api/axios.ts`
- ✅ Request interceptor (ajout token)
- ✅ Response interceptor (refresh token)
- ✅ Queue management
- ✅ Retry après refresh
- ✅ Logout si refresh échoue
- **Target**: 75%

---

### 8. Pages (Priority: BASSE)

#### Pages Auth
- ✅ Login (form validation, submit)
- ✅ Register (form validation, submit)
- ✅ ForgotPassword (form, submit)
- ✅ ResetPassword (form, submit)
- **Target**: 60%

#### Pages Dashboard
- ✅ DashboardIndex (rendu)
- ✅ AppointmentsList (rendu)
- ✅ PatientsList (rendu)
- **Target**: 50% (tests basiques, intégration complète plus tard)

---

## 📈 Stratégie d'Implémentation

### Phase 1 - Fondations (Semaine 1)
1. Tests utilitaires (logger, helpers, role-based-access)
2. Tests stores (auth.store)
3. Tests ProtectedRoute

**Coverage attendu**: ~40%

### Phase 2 - Hooks & Composants (Semaine 2)
4. Tests hooks (useAuth)
5. Tests composants UI (Button, Card, Input)
6. Tests ErrorBoundary

**Coverage attendu**: ~60%

### Phase 3 - Layouts & API (Semaine 3)
7. Tests layouts
8. Tests axios interceptors
9. Tests pages basiques

**Coverage attendu**: ~70%

---

## 🛠️ Outils & Configuration

### Jest Configuration
- ✅ Déjà configuré dans `jest.config.ts`
- ✅ Setup file: `src/__tests__/setup.ts`
- ✅ Coverage thresholds: 70%

### Commandes
```bash
# Tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Coverage Reports
- HTML report: `coverage/index.html`
- Terminal: `npm run test:coverage`

---

## 📊 Métriques de Succès

### Par Fichier
- **Utils**: 85%+
- **Stores**: 80%+
- **Hooks**: 75%+
- **Components**: 70%+
- **Pages**: 50%+

### Global
- **Lignes**: 70%+
- **Fonctions**: 75%+
- **Branches**: 65%+
- **Statements**: 70%+

---

## ✅ Checklist Tests

### Avant d'Écrire un Test
- [ ] Comprendre le comportement attendu
- [ ] Identifier les cas limites
- [ ] Identifier les cas d'erreur

### Structure d'un Test
- [ ] Arrange (setup)
- [ ] Act (action)
- [ ] Assert (vérification)

### Bonnes Pratiques
- [ ] Un test = une assertion principale
- [ ] Tests indépendants
- [ ] Noms descriptifs
- [ ] Pas de mocks inutiles
- [ ] Tests rapides

---

## 🎯 Exemples de Tests

### Test Utilitaire
```ts
describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('15 janvier 2024')
  })
})
```

### Test Hook
```ts
describe('useAuth', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### Test Composant
```ts
describe('Button', () => {
  it('should render with correct variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

---

## 📝 Notes

- Tests d'intégration E2E seront ajoutés plus tard (Playwright/Cypress)
- Tests de performance seront ajoutés si nécessaire
- Mocks API seront centralisés dans `src/__tests__/mocks/`

---

**Prochaine étape**: Implémenter les tests selon le plan.

