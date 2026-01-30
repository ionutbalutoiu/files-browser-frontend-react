import { test, expect } from '@playwright/test'
import { FileBrowserPage } from './pages/FileBrowserPage'

test.describe('Dialogs', () => {
  test('should open new folder dialog', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.openNewFolderDialog()
    await expect(page.getByText('New Folder')).toBeVisible()
    await expect(page.getByPlaceholder('Folder name')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('should close new folder dialog on cancel', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.openNewFolderDialog()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByPlaceholder('Folder name')).not.toBeVisible()
  })

  test('should show validation error for invalid folder name', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.openNewFolderDialog()
    await page.getByPlaceholder('Folder name').fill('.hidden')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Hidden files are not allowed')).toBeVisible()
  })

  test('should show validation error for path traversal', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.openNewFolderDialog()
    await page.getByPlaceholder('Folder name').fill('../parent')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Directory traversal is not allowed')).toBeVisible()
  })

  test('should show validation error for empty folder name', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()
    await fileBrowser.openNewFolderDialog()
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Folder name is required')).toBeVisible()
  })
})
