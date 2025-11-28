# 🔧 PHASE B - Plan de Corrections Détaillé

## Date: 2024

---

## 📋 Vue d'Ensemble

Ce document détaille **toutes les corrections** à appliquer pour éliminer les dettes techniques et améliorer la qualité du code.

---

## 🎯 STRATÉGIE DE CORRECTION

### Ordre d'Exécution
1. **Critiques** (bloquants)
2. **Moyennes** (améliorations importantes)
3. **Basses** (polish)

### Principe
- ✅ Un commit par correction logique
- ✅ Tests avant/après chaque correction
- ✅ Pas de régression
- ✅ Documentation des changements

---

## 🔴 CORRECTIONS CRITIQUES

### 1. Implémenter Lazy Loading des Pages

**Fichier**: `src/router/index.tsx`

**Avant**:
```tsx
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
// ... tous les imports statiques
```

**Après**:
```tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })))
// ... tous les autres
```

**Impact**: Réduction bundle initial ~40-60%

**Tests**: Vérifier que toutes les pages se chargent correctement

---

### 2. Utiliser Types API Partout

**Fichiers à modifier**:
- `src/hooks/useAuth.ts`
- `src/api/axios.ts` (si nécessaire)
- Futurs hooks API

**Actions**:
- Remplacer `LoginCredentials` par `LoginRequest` depuis `@/types/api`
- Remplacer `RegisterData` par `RegisterRequest` depuis `@/types/api`
- Utiliser `AuthResponse` partout
- Utiliser types pour toutes les réponses API

**Impact**: Type-safety complète

---

### 3. Corriger Types useAuth

**Fichier**: `src/hooks/useAuth.ts:18`

**Avant**:
```tsx
role?: string
```

**Après**:
```tsx
role?: User['role']
```

**Impact**: Type-safety stricte

---

## 🟡 CORRECTIONS MOYENNES

### 4. Créer Composant PageLayout Réutilisable

**Nouveau fichier**: `src/components/layouts/PageLayout.tsx`

**Fonctionnalité**:
- Header avec titre + description
- Bouton d'action optionnel
- Container pour contenu
- Utilisé par toutes les pages List

**Utilisation**:
```tsx
<PageLayout
  title="Patients"
  description="Gérez la liste de vos patients"
  actionButton={<Button>Nouveau patient</Button>}
>
  {/* Contenu */}
</PageLayout>
```

**Impact**: Réduction duplication ~80%

---

### 5. Créer Composant DetailPage Réutilisable

**Nouveau fichier**: `src/components/layouts/DetailPage.tsx`

**Fonctionnalité**:
- Header avec back button
- Titre + ID
- Container pour contenu
- Utilisé par toutes les pages Detail

**Impact**: Élimination duplication complète

---

### 6. Ajouter React.memo sur Composants

**Fichiers**:
- `src/layouts/DashboardLayout.tsx`
- `src/layouts/AuthLayout.tsx`
- `src/router/protected-route.tsx`
- `src/components/ErrorBoundary.tsx`

**Exemple**:
```tsx
export const DashboardLayout = React.memo(() => {
  // ...
})
```

**Impact**: Réduction re-renders inutiles

---

### 7. Ajouter useMemo pour Calculs

**Fichier**: `src/layouts/DashboardLayout.tsx`

**Avant**:
```tsx
const filteredNavItems = navItems.filter((item) =>
  accessibleRoutes.includes(item.path)
)
```

**Après**:
```tsx
const filteredNavItems = useMemo(
  () => navItems.filter((item) => accessibleRoutes.includes(item.path)),
  [accessibleRoutes]
)
```

**Impact**: Performance améliorée

---

### 8. Améliorer ProtectedRoute avec Feedback

**Fichier**: `src/router/protected-route.tsx`

**Ajout**:
- Toast/notification pour accès refusé
- Ou state dans location pour afficher message

**Impact**: Meilleure UX

---

### 9. Centraliser Gestion Erreurs API

**Nouveau fichier**: `src/hooks/useApiError.ts`

**Fonctionnalité**:
- Hook pour extraire messages d'erreur API
- Formatage cohérent
- Utilisé partout

**Impact**: Code plus propre, gestion cohérente

---

### 10. Extraire QueryClient

**Nouveau fichier**: `src/lib/query-client.ts`

**Contenu**:
```tsx
export const queryClient = new QueryClient({
  // config
})
```

**Impact**: Meilleure organisation

---

## 🟢 CORRECTIONS BASSES

### 11. Améliorer Types Axios Interceptor

**Fichier**: `src/api/axios.ts:102`

**Avant**:
```tsx
user?: typeof authStore.getState().user
```

**Après**:
```tsx
import { type User } from '@/store/auth.store'
user?: User
```

**Impact**: Code plus lisible

---

### 12. Nettoyer user.store.ts

**Action**: 
- Supprimer si vraiment inutilisé
- Ou documenter usage futur

**Impact**: Code plus clair

---

### 13. Ajouter Composants UI Manquants

**À créer**:
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/loading-spinner.tsx`
- `src/components/ui/table.tsx` (si nécessaire)

**Impact**: Design system complet

---

## 🧪 TESTS À AJOUTER

### 14. Tests ProtectedRoute

**Fichier**: `src/__tests__/ProtectedRoute.test.tsx`

**Tests**:
- Redirection si non authentifié
- Redirection si rôle non autorisé
- Accès si authentifié et autorisé

---

### 15. Tests ErrorBoundary

**Fichier**: `src/__tests__/ErrorBoundary.test.tsx`

**Tests**:
- Capture erreurs React
- Affiche fallback UI
- Logging des erreurs

---

### 16. Tests Button Component

**Fichier**: `src/__tests__/Button.test.tsx`

**Tests**:
- Rendu correct
- Variants fonctionnent
- Sizes fonctionnent
- Events handlers

---

### 17. Tests Logger Utility

**Fichier**: `src/__tests__/logger.test.ts`

**Tests**:
- Logging en dev
- Pas de logs en prod (sauf errors)
- Format correct

---

### 18. Tests Helpers

**Fichier**: `src/__tests__/helpers.test.ts`

**Tests**:
- formatDate
- formatDateTime
- formatPhoneNumber
- debounce
- capitalize
- getUserInitials
- isEmpty

---

### 19. Tests Role-Based-Access

**Fichier**: `src/__tests__/role-based-access.test.ts`

**Tests**:
- hasRouteAccess
- getAccessibleRoutes
- hasRole
- isAdmin
- isMedicalStaff

---

### 20. Tests Auth Store

**Fichier**: `src/__tests__/auth.store.test.ts`

**Tests**:
- setAuth
- clearAuth
- logout
- getters
- Persistence

---

## 📊 RÉSUMÉ DES CORRECTIONS

### Fichiers à Créer (10)
1. `src/components/layouts/PageLayout.tsx`
2. `src/components/layouts/DetailPage.tsx`
3. `src/hooks/useApiError.ts`
4. `src/lib/query-client.ts`
5. `src/components/ui/card.tsx`
6. `src/components/ui/input.tsx`
7. `src/components/ui/loading-spinner.tsx`
8. `src/__tests__/ProtectedRoute.test.tsx`
9. `src/__tests__/ErrorBoundary.test.tsx`
10. `src/__tests__/Button.test.tsx`
11. `src/__tests__/logger.test.ts`
12. `src/__tests__/helpers.test.ts`
13. `src/__tests__/role-based-access.test.ts`
14. `src/__tests__/auth.store.test.ts`

### Fichiers à Modifier (8)
1. `src/router/index.tsx` (lazy loading)
2. `src/hooks/useAuth.ts` (types API)
3. `src/api/axios.ts` (types)
4. `src/layouts/DashboardLayout.tsx` (memo, useMemo)
5. `src/layouts/AuthLayout.tsx` (memo)
6. `src/router/protected-route.tsx` (feedback)
7. `src/components/ErrorBoundary.tsx` (memo)
8. Toutes les pages List (utiliser PageLayout)
9. Toutes les pages Detail (utiliser DetailPage)

### Fichiers à Supprimer (1)
1. `src/store/user.store.ts` (si inutilisé)

---

## ⏱️ ESTIMATION TEMPS

- **Critiques**: 4-6 heures
- **Moyennes**: 6-8 heures
- **Basses**: 2-4 heures
- **Tests**: 8-10 heures

**Total**: 20-28 heures (2.5-3.5 jours)

---

## ✅ CHECKLIST DE VALIDATION

Après chaque correction:
- [ ] Code compile sans erreur
- [ ] Pas de warnings ESLint
- [ ] Tests passent
- [ ] Pas de régression
- [ ] Documentation à jour

---

**Prochaine étape**: Attendre validation avant d'appliquer les corrections.

