import { test, expect } from '@playwright/test'

async function waitForAppHydration(page: Parameters<typeof test>[0]['page']) {
  await page.waitForFunction(() => document.documentElement.dataset.appHydrated === 'true')
}

test('homepage loads primary conversion paths', async ({ page }) => {
  await page.goto('/')
  await waitForAppHydration(page)

  await expect(page.getByRole('heading', { name: /protecting your home/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /schedule free inspection/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /roofing/i }).first()).toBeVisible()
})

test('contact form submits and reaches thank-you page', async ({ page }) => {
  await page.goto('/contact?service=Roofing&source=test-suite')
  await waitForAppHydration(page)

  await page.getByLabel(/first name/i).fill('Taylor')
  await page.getByLabel(/last name/i).fill('Jordan')
  await page.getByLabel(/^email/i).fill('taylor@example.com')
  await page.getByLabel(/^phone/i).fill('555-123-4567')
  await page.getByLabel(/service needed/i).selectOption('Roofing')
  await page.getByRole('button', { name: /send message/i }).click()

  await expect(page).toHaveURL(/\/thank-you$/)
  await expect(page.getByText(/request summary/i)).toBeVisible()
})

test('resource article exposes helpful internal links', async ({ page }) => {
  await page.goto('/resources')
  await waitForAppHydration(page)
  await page.getByRole('link', { name: /read more/i }).first().click()

  await expect(page).toHaveURL(/\/resources\/[^/]+$/)
  await expect(page.getByRole('heading', { name: /helpful service pages/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /schedule an inspection/i })).toBeVisible()
})
