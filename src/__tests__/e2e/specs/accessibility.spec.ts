/**
 * Accessibility E2E Tests with Axe
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('dashboard should not have accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"], input[type="email"]', 'doctor@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})

