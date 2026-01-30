import { z } from 'zod'

/**
 * Schema for shares listing response (array of share paths).
 */
export const SharesListingSchema = z.array(z.string())

export type SharesListing = z.infer<typeof SharesListingSchema>

/**
 * Schema for create share request.
 */
export const CreateShareRequestSchema = z.object({
  path: z.string(),
})

export type CreateShareRequest = z.infer<typeof CreateShareRequestSchema>
