import { test, expect } from '@playwright/test'
import { FileBrowserPage } from './pages/FileBrowserPage'

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API to return test files
    await page.route('**/files/**format=json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { name: 'folder1', type: 'directory', mtime: '2024-01-01T00:00:00Z' },
          { name: 'folder2', type: 'directory', mtime: '2024-01-02T00:00:00Z' },
          { name: 'file1.txt', type: 'file', mtime: '2024-01-03T00:00:00Z', size: 1024 },
          { name: 'file2.txt', type: 'file', mtime: '2024-01-04T00:00:00Z', size: 2048 },
        ]),
      })
    })
  })

  test('should select first item with arrow down', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await page.keyboard.press('ArrowDown')
    const isSelected = await fileBrowser.isFileSelected('folder1')
    expect(isSelected).toBe(true)
  })

  test('should navigate down through files', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    const isSelected = await fileBrowser.isFileSelected('folder2')
    expect(isSelected).toBe(true)
  })

  test('should select all with Ctrl+A', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await page.keyboard.press('Control+a')

    const rows = await fileBrowser.getFileRows()
    for (const row of rows) {
      const classes = await row.getAttribute('class')
      expect(classes).toContain('bg-accent')
    }
  })

  test('should clear selection with Escape', async ({ page }) => {
    const fileBrowser = new FileBrowserPage(page)
    await fileBrowser.goto()

    await fileBrowser.clickFile('folder1')
    let isSelected = await fileBrowser.isFileSelected('folder1')
    expect(isSelected).toBe(true)

    await page.keyboard.press('Escape')
    isSelected = await fileBrowser.isFileSelected('folder1')
    expect(isSelected).toBe(false)
  })
})
