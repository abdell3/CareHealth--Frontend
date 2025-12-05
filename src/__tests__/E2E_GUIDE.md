# 🎭 Guide E2E - Playwright

Guide pour écrire et exécuter les tests E2E avec Playwright.

## 🚀 Installation

```bash
npx playwright install
```

## 📝 Écrire un Test

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## 🎯 Best Practices

1. **Utiliser les sélecteurs accessibles** :
   - `getByRole`
   - `getByLabelText`
   - `getByText`

2. **Attendre les éléments** :
   ```typescript
   await expect(page.locator('text=Welcome')).toBeVisible()
   ```

3. **Grouper les tests** :
   ```typescript
   test.describe('Feature', () => {
     test.beforeEach(async ({ page }) => {
       // Setup commun
     })
   })
   ```

4. **Utiliser les fixtures** pour les données de test

## 🔧 Configuration

Voir `playwright.config.ts` pour la configuration complète.

## 📊 Rapports

```bash
# Générer rapport HTML
npx playwright show-report
```

---

**Dernière mise à jour** : Décembre 2024

