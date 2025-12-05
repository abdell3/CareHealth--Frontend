/**
 * Appointments E2E Tests
 */

import { test, expect } from '@playwright/test'

test.describe('Appointments', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor
    await page.goto('/login')
    await page.fill('input[name="email"], input[type="email"]', 'doctor@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('doctor can view appointments list', async ({ page }) => {
    await page.goto('/dashboard/appointments')
    
    // Verify appointments page loads
    await expect(page.locator('text=/rendez-vous|appointments/i')).toBeVisible()
  })

  test('patient can view upcoming appointments', async ({ page }) => {
    // Login as patient (would need patient credentials)
    await page.goto('/login')
    // ... patient login flow
    
    await page.goto('/patient/appointments')
    
    // Verify appointments are visible
    await expect(page.locator('text=/rendez-vous|appointments/i')).toBeVisible()
  })
})

