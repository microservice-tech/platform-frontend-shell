import { test, expect } from '@playwright/test'

test.describe('Frontend Shell', () => {
  test('displays landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Platform Frontend Shell')
  })

  test('header is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shell-header')).toBeVisible()
  })

  test('shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shell-header-login-btn')).toBeVisible()
  })

  test('public layout does not have sidebar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.shell-sidebar')).not.toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('redirects to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/app')
    // Without Keycloak configured, should show loading or redirect
    // This test validates the redirect behavior works
    const url = page.url()
    expect(url).not.toContain('/app')
  })
})
