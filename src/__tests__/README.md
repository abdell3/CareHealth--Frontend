# 🧪 Suite de Tests - CareHealth Frontend

Suite de tests complète avec objectif de coverage 85%+.

## 📊 Coverage Actuel

**Objectif** : 85%+  
**Configuration** : Voir `jest.config.ts`

## 🎯 Types de Tests

### 1. Tests Unitaires (Jest + Testing Library)

**Location** : `src/__tests__/unit/`

- ✅ Composants : `components/`
- ✅ Hooks : `hooks/`
- ✅ Utils : `utils/`
- ✅ Services : `services/`

**Exécution** :
```bash
npm run test:unit
npm run test:coverage
```

### 2. Tests d'Intégration

**Location** : `src/__tests__/integration/`

- ✅ Auth flow
- ✅ Patient CRUD
- ✅ Prescription workflow

**Exécution** :
```bash
npm run test:integration
```

### 3. Tests E2E (Playwright)

**Location** : `src/__tests__/e2e/specs/`

- ✅ Authentication
- ✅ Appointments
- ✅ Accessibility

**Exécution** :
```bash
npm run test:e2e
npm run test:e2e:ui  # Mode interactif
```

### 4. Tests Accessibilité

**Location** : `src/__tests__/unit/accessibility.test.tsx`

- ✅ Axe-core integration
- ✅ WCAG compliance

**Exécution** :
```bash
npm run test:accessibility
```

### 5. Tests Performance (Lighthouse CI)

**Configuration** : `lighthouserc.json`

**Exécution** :
```bash
lhci autorun
```

## 🛠️ Configuration

### Jest

- **Config** : `jest.config.ts`
- **Setup** : `src/__tests__/setup.ts`
- **Coverage Threshold** : 85%

### MSW (Mock Service Worker)

- **Server** : `src/__tests__/mocks/server.ts`
- **Handlers** : `src/__tests__/mocks/handlers.ts`

### Playwright

- **Config** : `playwright.config.ts`
- **Browsers** : Chrome, Firefox, Safari, Mobile

## 📚 Documentation

- [Guide de Tests](./TESTING_GUIDE.md) - Guide complet
- [Guide de Mocking](./MOCKING_GUIDE.md) - Stratégie mocking
- [Guide E2E](./E2E_GUIDE.md) - Tests Playwright
- [Performance Testing](./PERFORMANCE_TESTING.md) - Tests performance

## 🚀 CI/CD

Tests automatiques sur :
- Push vers main/develop
- Pull requests

Voir `.github/workflows/test.yml`

## 📈 Métriques

- **Coverage** : 85%+ (objectif)
- **Performance** : Lighthouse 90+
- **Accessibility** : WCAG AA compliant
- **E2E** : Tous les flux critiques

## ✅ Checklist

- [x] Configuration Jest
- [x] Configuration MSW
- [x] Tests unitaires composants
- [x] Tests unitaires hooks
- [x] Tests unitaires utils
- [x] Tests unitaires services
- [x] Tests d'intégration
- [x] Configuration Playwright
- [x] Tests E2E
- [x] Tests accessibilité
- [x] Configuration Lighthouse
- [x] CI/CD workflows
- [x] Documentation

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024

