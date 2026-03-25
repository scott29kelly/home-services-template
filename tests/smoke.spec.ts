import { test, expect } from '@playwright/test'

async function waitForAppHydration(page: Parameters<typeof test>[0]['page']) {
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === 'true')
}

async function waitForFormReady(
  page: Parameters<typeof test>[0]['page'],
  submitButton: ReturnType<Parameters<typeof test>[0]['page']['locator']>,
) {
  await expect(submitButton).toBeEnabled({
    timeout: 45000,
  })
}

async function attachAnalyticsCollector(page: Parameters<typeof test>[0]['page']) {
  await page.addInitScript(() => {
    const globalWindow = window as typeof window & {
      __analyticsEvents?: Array<Record<string, unknown>>
    }

    globalWindow.__analyticsEvents = []
    window.addEventListener('home-services:analytics', (event) => {
      const customEvent = event as CustomEvent<Record<string, unknown>>
      globalWindow.__analyticsEvents?.push(customEvent.detail)
    })
  })
}

async function getAnalyticsEvents(page: Parameters<typeof test>[0]['page']) {
  return page.evaluate(() => {
    const globalWindow = window as typeof window & {
      __analyticsEvents?: Array<Record<string, unknown>>
    }

    return globalWindow.__analyticsEvents ?? []
  })
}

test('homepage loads primary conversion paths', async ({ page }) => {
  await page.goto('/')
  await waitForAppHydration(page)

  await expect(page.getByRole('heading', { name: /protecting your home/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /schedule free inspection/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /roofing/i }).first()).toBeVisible()
})

test('service pages render without runtime errors', async ({ page }) => {
  await page.goto('/roofing')
  await waitForAppHydration(page)

  await expect(page.getByRole('heading', { name: /helpful roofing resources/i })).toBeVisible()
  await expect(page.getByText(/application error/i)).not.toBeVisible()
})

test('contact form submits and reaches thank-you page', async ({ page }) => {
  await attachAnalyticsCollector(page)
  await page.goto('/contact?service=Roofing&source=test-suite')
  await waitForFormReady(page, page.locator('form button[type="submit"]').first())

  await page.getByLabel(/first name/i).fill('Taylor')
  await page.getByLabel(/last name/i).fill('Jordan')
  await page.getByLabel(/^email/i).fill('taylor@example.com')
  await page.getByLabel(/^phone/i).fill('555-123-4567')
  await page.getByLabel(/service needed/i).selectOption('Roofing')
  await page.getByRole('button', { name: /send message/i }).click()

  await expect(page).toHaveURL(/\/thank-you$/)
  await expect(page.getByText(/request summary/i)).toBeVisible()

  const analyticsEvents = await getAnalyticsEvents(page)
  expect(
    analyticsEvents.some(
      (event) =>
        event.event === 'lead_form_submitted' &&
        event.form_type === 'contact' &&
        event.source_label === 'test-suite',
    ),
  ).toBeTruthy()
})

test('resource article exposes helpful internal links', async ({ page }) => {
  await page.goto('/resources')
  await waitForAppHydration(page)
  await page.getByRole('link', { name: /does homeowners insurance cover storm damage/i }).nth(1).click()

  await expect(page).toHaveURL(/\/resources\/[^/]+$/)
  await expect(page.getByRole('heading', { name: /helpful service pages/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /schedule an inspection/i })).toBeVisible()
})

test('booking flow reaches thank-you page and preserves attribution', async ({ page }) => {
  await attachAnalyticsCollector(page)
  await page.goto('/contact?tab=booking&service=Roofing&source=test-booking&utm_source=google&utm_campaign=spring-storm')
  await waitForFormReady(page, page.locator('form button[type="submit"]').first())

  await page.locator('[role="grid"] button:not([disabled])').first().click()
  await page.getByText('Morning (8am-12pm)').click()
  await page.getByLabel(/first name/i).fill('Jordan')
  await page.getByLabel(/last name/i).fill('Casey')
  await page.getByLabel(/^email/i).fill('jordan@example.com')
  await page.getByLabel(/^phone/i).fill('555-222-3333')
  await page.getByLabel(/property address/i).fill('123 Main St')
  await page.getByLabel(/service needed/i).selectOption('Roofing')
  await page.getByRole('button', { name: /request appointment/i }).click()

  await expect(page).toHaveURL(/\/thank-you$/)
  await expect(page.getByText(/inspection request/i)).toBeVisible()
  await expect(page.getByText(/started on \/contact/i)).toBeVisible()
  await expect(page.getByText(/utm source: google/i)).toBeVisible()

  const analyticsEvents = await getAnalyticsEvents(page)
  expect(
    analyticsEvents.some(
      (event) =>
        event.event === 'lead_form_submitted' &&
        event.form_type === 'booking' &&
        event.source_label === 'test-booking',
    ),
  ).toBeTruthy()
  expect(
    analyticsEvents.some(
      (event) =>
        event.event === 'thank_you_viewed' &&
        event.utm_source === 'google' &&
        event.utm_campaign === 'spring-storm',
    ),
  ).toBeTruthy()

  const submission = await page.evaluate(() => {
    const raw = window.sessionStorage.getItem('home-services:last-submission')
    return raw ? JSON.parse(raw) : null
  })
  expect(submission).not.toBeNull()
  expect(submission.leadType).toBe('booking')
  expect(submission.landingPage).toContain('/contact')
  expect(submission.utmSource).toBe('google')
  expect(submission.utmCampaign).toBe('spring-storm')
})

test('resources and city pages route visitors into service pages', async ({ page }) => {
  await page.goto('/resources')
  await waitForAppHydration(page)

  await page.getByRole('link', { name: /anytown, tx/i }).click()
  await expect(page).toHaveURL(/\/service-areas\/anytown$/)

  await page.getByRole('link', { name: /springfield/i }).last().click()
  await expect(page).toHaveURL(/\/service-areas\/springfield$/)

  await page.locator('main').getByRole('link', { name: /roofing/i }).first().click()
  await expect(page).toHaveURL(/\/roofing$/)
})

test('ava handoff quick action tracks escalation requests', async ({ page }) => {
  await attachAnalyticsCollector(page)
  await page.goto('/ava')
  await waitForAppHydration(page)

  await page.getByRole('button', { name: /talk to a real person/i }).click()
  await expect(page.getByText(/you can reach our team directly/i)).toBeVisible()

  const analyticsEvents = await getAnalyticsEvents(page)
  expect(
    analyticsEvents.some((event) => event.event === 'chat_escalation_requested'),
  ).toBeTruthy()
})
