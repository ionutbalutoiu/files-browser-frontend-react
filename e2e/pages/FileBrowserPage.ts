import { Page, Locator, expect } from '@playwright/test'

export class FileBrowserPage {
  readonly page: Page
  readonly fileList: Locator
  readonly breadcrumbs: Locator
  readonly toolbar: Locator
  readonly newFolderButton: Locator
  readonly uploadButton: Locator

  constructor(page: Page) {
    this.page = page
    this.fileList = page.locator('[data-file-row]')
    this.breadcrumbs = page.locator('nav')
    this.toolbar = page.locator('div').filter({ hasText: /New Folder/ }).first()
    this.newFolderButton = page.getByRole('button', { name: /New Folder/ })
    this.uploadButton = page.getByRole('button', { name: /Upload/ })
  }

  async goto(path = '') {
    await this.page.goto(`/browse/${path}`)
  }

  async getFileRows() {
    return this.fileList.all()
  }

  async getFileNames() {
    const rows = await this.getFileRows()
    const names: string[] = []
    for (const row of rows) {
      const name = await row.locator('span').first().textContent()
      if (name) names.push(name)
    }
    return names
  }

  async clickFile(name: string) {
    await this.page.locator(`[data-file-row]:has-text("${name}")`).click()
  }

  async doubleClickFile(name: string) {
    await this.page.locator(`[data-file-row]:has-text("${name}")`).dblclick()
  }

  async rightClickFile(name: string) {
    await this.page.locator(`[data-file-row]:has-text("${name}")`).click({ button: 'right' })
  }

  async rightClickBackground() {
    await this.page.locator('main').click({ button: 'right', position: { x: 100, y: 400 } })
  }

  async openNewFolderDialog() {
    await this.newFolderButton.click()
  }

  async createFolder(name: string) {
    await this.openNewFolderDialog()
    await this.page.getByPlaceholder('Folder name').fill(name)
    await this.page.getByRole('button', { name: 'Create' }).click()
  }

  async waitForFolderToAppear(name: string) {
    await expect(this.page.locator(`[data-file-row]:has-text("${name}")`)).toBeVisible()
  }

  async selectFile(name: string, options?: { ctrlKey?: boolean; shiftKey?: boolean }) {
    const modifiers: ('Control' | 'Shift')[] = []
    if (options?.ctrlKey) modifiers.push('Control')
    if (options?.shiftKey) modifiers.push('Shift')

    await this.page.locator(`[data-file-row]:has-text("${name}")`).click({ modifiers })
  }

  async renameFile(oldName: string, newName: string) {
    await this.rightClickFile(oldName)
    await this.page.getByRole('button', { name: 'Rename' }).click()
    await this.page.getByPlaceholder('New name').clear()
    await this.page.getByPlaceholder('New name').fill(newName)
    await this.page.getByRole('button', { name: 'Rename' }).click()
  }

  async deleteFile(name: string) {
    await this.rightClickFile(name)
    await this.page.getByRole('button', { name: 'Delete' }).click()
    await this.page.getByRole('button', { name: 'Delete' }).click()
  }

  async expectFileExists(name: string) {
    await expect(this.page.locator(`[data-file-row]:has-text("${name}")`)).toBeVisible()
  }

  async expectFileNotExists(name: string) {
    await expect(this.page.locator(`[data-file-row]:has-text("${name}")`)).not.toBeVisible()
  }

  async expectBreadcrumb(text: string) {
    await expect(this.breadcrumbs).toContainText(text)
  }

  async navigateToBreadcrumb(name: string) {
    await this.breadcrumbs.getByRole('link', { name }).click()
  }

  async isFileSelected(name: string) {
    const row = this.page.locator(`[data-file-row]:has-text("${name}")`)
    const classes = await row.getAttribute('class')
    return classes?.includes('bg-accent') ?? false
  }

  async expectEmptyState() {
    await expect(this.page.getByText('This folder is empty')).toBeVisible()
  }
}
