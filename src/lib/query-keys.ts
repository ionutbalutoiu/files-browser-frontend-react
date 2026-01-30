/**
 * Query key factory for react-query.
 * Ensures consistent key structure across the application.
 */
export const queryKeys = {
  /** All directory-related queries */
  dirs: {
    all: ['dir'] as const,
    detail: (path: string) => ['dir', path] as const,
  },

  /** All share-related queries */
  shares: {
    all: ['shares'] as const,
  },
} as const
