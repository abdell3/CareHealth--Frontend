/**
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('user can login and access dashboard', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', 'doctor@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'Password123!')
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Login")')
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    
    // Verify dashboard content
    await expect(page.locator('text=/bienvenue|welcome/i')).toBeVisible()
  })

  test('protected routes redirect to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard/patients')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('user can logout', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"], input[type="email"]', 'doctor@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    }
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', 'wrong@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(
      page.locator('text=/error|erreur|invalid|incorrect/i')
    ).toBeVisible({ timeout: 5000 })
  })
})

