import { test, expect } from '@playwright/test'
import { FileBrowserPage } from './pages/FileBrowserPage'

test.describe('Context Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API to return test files
    await page.route('**/files/**format=json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { name: 'test-folder', type: 'directory', mtime: '2024-01-01T00:00:00Z' },
          { name: 'test-file.txt', type: 'file', mtime: '2024-01-02T00:00:00Z', size: 1024 },
        ]),
      })
    })
  })

  test('should show context menu on right click background', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.rightClickBackground()
    await expect(page.getByRole('button', { name: 'New Folder' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Upload Files' })).toBeVisible()
  })

  test('should show context menu on right click file', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.rightClickFile('test-file.txt')
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rename' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('should show Open option for folders', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.rightClickFile('test-folder')
    await expect(page.getByRole('button', { name: 'Open' })).toBeVisible()
  })

  test('should close context menu on click outside', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.rightClickFile('test-file.txt')
    await expect(page.getByRole('button', { name: 'Rename' })).toBeVisible()

    // Click outside the context menu
    await page.locator('header').click()
    await expect(page.getByRole('button', { name: 'Rename' })).not.toBeVisible()
  })

  test('should open rename dialog from context menu', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.rightClickFile('test-file.txt')
    await page.getByRole('button', { name: 'Rename' }).click()

    await expect(page.getByText('Enter a new name')).toBeVisible()
    await expect(page.getByPlaceholder('New name')).toHaveValue('test-file.txt')
  })
})
