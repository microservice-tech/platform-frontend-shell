import { test, expect } from '@playwright/test'

test.describe('Dashboard Loading Diagnostic', () => {
  test('investigate dashboard loading state', async ({ page, context }) => {
    // Array to capture console messages
    const consoleMessages: Array<{ type: string; text: string }> = []
    const errors: Array<string> = []
    const warnings: Array<string> = []

    // Capture console output
    page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()
      consoleMessages.push({ type, text })

      if (type === 'error') {
        errors.push(text)
      } else if (type === 'warning') {
        warnings.push(text)
      }

      console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`)
    })

    // Capture page errors
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR]: ${error.message}`)
      errors.push(`Page Error: ${error.message}`)
    })

    // Capture failed requests
    const failedRequests: Array<{ url: string; status: number; method: string }> = []
    page.on('response', (response) => {
      if (!response.ok()) {
        const req = response.request()
        failedRequests.push({
          url: req.url(),
          status: response.status(),
          method: req.method(),
        })
        console.log(`[FAILED REQUEST]: ${req.method()} ${req.url()} - ${response.status()}`)
      }
    })

    // Track network requests
    const apiRequests: Array<{ url: string; method: string; status: number }> = []
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('/api/') || url.includes('/auth/')) {
        apiRequests.push({
          url,
          method: response.request().method(),
          status: response.status(),
        })
        console.log(`[API REQUEST]: ${response.request().method()} ${url} - ${response.status()}`)
      }
    })

    console.log('\n=== Starting Dashboard Navigation ===\n')

    // Navigate to dashboard with SSL error ignore
    try {
      await page.goto('https://localhost:5173/dashboard', {
        waitUntil: 'networkidle',
        timeout: 30000,
      })
    } catch (error) {
      console.log(`[NAVIGATION ERROR]: ${error}`)
    }

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000)

    console.log('\n=== Current Page State ===\n')

    // Check page title
    const title = await page.title()
    console.log(`Page Title: ${title}`)

    // Check URL (redirects?)
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)

    // Check for loading indicators
    const loadingText = await page.locator('text=Loading').count()
    console.log(`"Loading..." text found: ${loadingText} times`)

    // Check for auth-related elements
    const authCheckResults = {
      loginButton: await page.locator('button:has-text("Login")').count(),
      logoutButton: await page.locator('button:has-text("Logout")').count(),
      dashboardContent: await page.locator('[data-testid="dashboard"]').count(),
      errorMessage: await page.locator('text=Error').count(),
      authError: await page.locator('text=Authentication').count(),
    }

    console.log('Auth-related elements:', authCheckResults)

    // Check localStorage for auth tokens
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          const value = window.localStorage.getItem(key)
          if (value) {
            // Only show non-sensitive info
            if (key.includes('token') || key.includes('auth')) {
              items[key] = value.substring(0, 50) + '...[truncated]'
            } else {
              items[key] = value
            }
          }
        }
      }
      return items
    })

    console.log('\nLocalStorage keys:', Object.keys(localStorage))

    // Check if Keycloak is initialized
    const keycloakState = await page.evaluate(() => {
      // @ts-ignore
      return {
        // @ts-ignore
        keycloakExists: typeof window.keycloak !== 'undefined',
        // @ts-ignore
        authenticated: window.keycloak?.authenticated,
        // @ts-ignore
        realm: window.keycloak?.realm,
      }
    }).catch(() => ({ keycloakExists: false, authenticated: null, realm: null }))

    console.log('Keycloak State:', keycloakState)

    // Check React state if possible
    const reactState = await page.evaluate(() => {
      // Check if React DevTools data is available
      const rootElement = document.getElementById('root')
      if (rootElement) {
        return {
          hasContent: rootElement.innerHTML.length > 0,
          innerHTML: rootElement.innerHTML.substring(0, 500),
        }
      }
      return { hasContent: false, innerHTML: '' }
    })

    console.log('\nReact Root Element has content:', reactState.hasContent)
    console.log('Root innerHTML preview:', reactState.innerHTML)

    // Take screenshot
    const screenshotPath = '/home/nic/Development/foundation/platform-frontend-shell/dashboard-loading-state.png'
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`\nScreenshot saved to: ${screenshotPath}`)

    // Generate summary report
    console.log('\n=== DIAGNOSTIC SUMMARY ===\n')
    console.log('Console Errors:', errors.length)
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))

    console.log('\nConsole Warnings:', warnings.length)
    warnings.slice(0, 5).forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`))

    console.log('\nFailed Requests:', failedRequests.length)
    failedRequests.forEach((req, i) => console.log(`  ${i + 1}. ${req.method} ${req.url} - ${req.status}`))

    console.log('\nAPI Requests:', apiRequests.length)
    apiRequests.forEach((req, i) => console.log(`  ${i + 1}. ${req.method} ${req.url} - ${req.status}`))

    console.log('\nCurrent State:')
    console.log(`  - URL: ${currentUrl}`)
    console.log(`  - Shows "Loading...": ${loadingText > 0}`)
    console.log(`  - Has Dashboard Content: ${authCheckResults.dashboardContent > 0}`)
    console.log(`  - Keycloak Authenticated: ${keycloakState.authenticated}`)

    // Determine likely cause
    console.log('\n=== LIKELY CAUSE ANALYSIS ===\n')

    if (errors.length > 0) {
      console.log('❌ Console errors detected - check error messages above')
    }

    if (failedRequests.length > 0) {
      console.log('❌ Failed network requests detected - check requests above')
    }

    if (!keycloakState.authenticated && !currentUrl.includes('auth.localhost')) {
      console.log('⚠️  Not authenticated and not on Keycloak login page')
      console.log('   → Keycloak redirect may be failing or not configured')
    }

    if (loadingText > 0 && apiRequests.length === 0) {
      console.log('⚠️  Stuck on "Loading..." with no API requests')
      console.log('   → API calls may be blocked or not initiated')
    }

    if (currentUrl.includes('auth.localhost')) {
      console.log('✓ Successfully redirected to Keycloak')
      console.log('   → Need to complete login flow')
    }

    console.log('\n=========================\n')
  })
})
