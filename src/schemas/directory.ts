import { z } from 'zod'

/**
 * Schema for a single directory entry from Nginx autoindex JSON format.
 */
export const DirectoryEntrySchema = z.object({
  name: z.string(),
  type: z.enum(['file', 'directory']),
  mtime: z.string(), // ISO date string
  size: z.number().optional(), // Only present for files
})

export type DirectoryEntry = z.infer<typeof DirectoryEntrySchema>

/**
 * Schema for directory listing response (array of entries).
 */
export const DirectoryListingSchema = z.array(DirectoryEntrySchema)

export type DirectoryListing = z.infer<typeof DirectoryListingSchema>

/**
 * Schema for API error response.
 */
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>

/**
 * Schema for create folder request.
 */
export const CreateFolderRequestSchema = z.object({
  path: z.string(),
})

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>

/**
 * Schema for rename request.
 */
export const RenameRequestSchema = z.object({
  path: z.string(),
  name: z.string(),
})

export type RenameRequest = z.infer<typeof RenameRequestSchema>

/**
 * Schema for move request.
 */
export const MoveRequestSchema = z.object({
  from: z.string(),
  to: z.string(),
})

export type MoveRequest = z.infer<typeof MoveRequestSchema>
