import { test, expect } from '@playwright/test'
import { FileBrowserPage } from './pages/FileBrowserPage'

test.describe('File Browser', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/browse')
    await expect(page.getByText('File Browser')).toBeVisible()
  })

  test('should show Files and Shares navigation', async ({ page }) => {
    await page.goto('/browse')
    await expect(page.getByRole('link', { name: 'Files' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Shares' })).toBeVisible()
  })

  test('should show breadcrumbs with Home', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.expectBreadcrumb('Home')
  })

  test('should show toolbar with New Folder and Upload buttons', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await expect(fileBrowser.newFolderButton).toBeVisible()
    await expect(fileBrowser.uploadButton).toBeVisible()
  })

  test('should navigate to shares page', async ({ page }) => {
    await page.goto('/browse')
    await page.getByRole('link', { name: 'Shares' }).click()
    await expect(page).toHaveURL('/shares')
    await expect(page.getByText('Shared Items')).toBeVisible()
  })
})
