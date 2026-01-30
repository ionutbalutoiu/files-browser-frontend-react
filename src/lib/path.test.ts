import { describe, expect, it } from 'vitest'
import {
  validatePath,
  joinPath,
  dirname,
  basename,
  extname,
  encodePathForApi,
  getParentPaths,
  isChildOf,
} from './path'

describe('validatePath', () => {
  it('accepts empty path', () => {
    expect(validatePath('')).toEqual({ valid: true, normalized: '' })
  })

  it('accepts simple path', () => {
    expect(validatePath('folder')).toEqual({ valid: true, normalized: 'folder' })
  })

  it('accepts nested path', () => {
    expect(validatePath('folder/subfolder/file.txt')).toEqual({
      valid: true,
      normalized: 'folder/subfolder/file.txt',
    })
  })

  it('normalizes trailing slashes', () => {
    expect(validatePath('folder/')).toEqual({ valid: true, normalized: 'folder' })
  })

  it('normalizes multiple slashes', () => {
    expect(validatePath('folder//subfolder')).toEqual({
      valid: true,
      normalized: 'folder/subfolder',
    })
  })

  it('rejects absolute paths', () => {
    expect(validatePath('/folder')).toEqual({
      valid: false,
      error: 'Absolute paths are not allowed',
    })
  })

  it('rejects directory traversal', () => {
    expect(validatePath('folder/../other')).toEqual({
      valid: false,
      error: 'Directory traversal is not allowed',
    })
  })

  it('rejects directory traversal at start', () => {
    expect(validatePath('../folder')).toEqual({
      valid: false,
      error: 'Directory traversal is not allowed',
    })
  })

  it('rejects null bytes', () => {
    expect(validatePath('folder\0')).toEqual({
      valid: false,
      error: 'Path contains null bytes',
    })
  })

  it('rejects backslashes', () => {
    expect(validatePath('folder\\subfolder')).toEqual({
      valid: false,
      error: 'Path contains backslashes',
    })
  })

  it('rejects hidden files', () => {
    expect(validatePath('.hidden')).toEqual({
      valid: false,
      error: 'Hidden files are not allowed',
    })
  })

  it('rejects hidden folders in path', () => {
    expect(validatePath('folder/.hidden/file.txt')).toEqual({
      valid: false,
      error: 'Hidden files are not allowed',
    })
  })
})

describe('joinPath', () => {
  it('joins simple paths', () => {
    expect(joinPath('folder', 'file.txt')).toBe('folder/file.txt')
  })

  it('joins multiple segments', () => {
    expect(joinPath('a', 'b', 'c')).toBe('a/b/c')
  })

  it('handles empty segments', () => {
    expect(joinPath('', 'folder', '')).toBe('folder')
  })

  it('handles paths with slashes', () => {
    expect(joinPath('folder/subfolder', 'file.txt')).toBe('folder/subfolder/file.txt')
  })

  it('throws on invalid result', () => {
    expect(() => joinPath('..', 'folder')).toThrow('Invalid path')
  })
})

describe('dirname', () => {
  it('returns empty for root-level path', () => {
    expect(dirname('file.txt')).toBe('')
  })

  it('returns empty for empty path', () => {
    expect(dirname('')).toBe('')
  })

  it('returns parent folder', () => {
    expect(dirname('folder/file.txt')).toBe('folder')
  })

  it('returns nested parent', () => {
    expect(dirname('a/b/c/file.txt')).toBe('a/b/c')
  })
})

describe('basename', () => {
  it('returns the filename', () => {
    expect(basename('folder/file.txt')).toBe('file.txt')
  })

  it('returns folder name for folder path', () => {
    expect(basename('folder')).toBe('folder')
  })

  it('returns empty for empty path', () => {
    expect(basename('')).toBe('')
  })

  it('handles nested paths', () => {
    expect(basename('a/b/c/file.txt')).toBe('file.txt')
  })
})

describe('extname', () => {
  it('returns file extension', () => {
    expect(extname('file.txt')).toBe('.txt')
  })

  it('returns empty for no extension', () => {
    expect(extname('file')).toBe('')
  })

  it('returns empty for dotfile', () => {
    expect(extname('.gitignore')).toBe('')
  })

  it('returns last extension for multiple dots', () => {
    expect(extname('archive.tar.gz')).toBe('.gz')
  })

  it('handles paths', () => {
    expect(extname('folder/file.txt')).toBe('.txt')
  })
})

describe('encodePathForApi', () => {
  it('encodes special characters', () => {
    expect(encodePathForApi('folder/file name.txt')).toBe('folder/file%20name.txt')
  })

  it('preserves slashes', () => {
    expect(encodePathForApi('a/b/c')).toBe('a/b/c')
  })

  it('encodes each segment separately', () => {
    expect(encodePathForApi('folder with spaces/file.txt')).toBe(
      'folder%20with%20spaces/file.txt'
    )
  })

  it('handles empty path', () => {
    expect(encodePathForApi('')).toBe('')
  })

  it('encodes unicode characters', () => {
    expect(encodePathForApi('文件/名称.txt')).toBe('%E6%96%87%E4%BB%B6/%E5%90%8D%E7%A7%B0.txt')
  })
})

describe('getParentPaths', () => {
  it('returns empty for root-level path', () => {
    expect(getParentPaths('file.txt')).toEqual([])
  })

  it('returns empty for empty path', () => {
    expect(getParentPaths('')).toEqual([])
  })

  it('returns parent paths', () => {
    expect(getParentPaths('a/b/c/file.txt')).toEqual(['a', 'a/b', 'a/b/c'])
  })

  it('returns single parent', () => {
    expect(getParentPaths('folder/file.txt')).toEqual(['folder'])
  })
})

describe('isChildOf', () => {
  it('returns true for direct child', () => {
    expect(isChildOf('folder/file.txt', 'folder')).toBe(true)
  })

  it('returns true for nested child', () => {
    expect(isChildOf('a/b/c/file.txt', 'a/b')).toBe(true)
  })

  it('returns false for same path', () => {
    expect(isChildOf('folder', 'folder')).toBe(false)
  })

  it('returns false for parent', () => {
    expect(isChildOf('folder', 'folder/subfolder')).toBe(false)
  })

  it('returns false for sibling', () => {
    expect(isChildOf('folder1/file.txt', 'folder2')).toBe(false)
  })

  it('returns true for empty parent (root)', () => {
    expect(isChildOf('file.txt', '')).toBe(true)
  })

  it('returns false for empty child', () => {
    expect(isChildOf('', 'folder')).toBe(false)
  })
})
