import { QueryClient, QueryClientProvider, MutationCache, Mutation } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { showNotification } from '../stores/notificationStore'
import { ApiError } from '../api/client'
import { basename } from '../lib/path'

interface MutationVariables {
  path?: string
  from?: string
  to?: string
  name?: string
  paths?: string[]
}

function getErrorContext(mutation: Mutation<unknown, unknown, unknown>): string | null {
  const variables = mutation.state.variables as MutationVariables | undefined
  if (!variables) return null

  // Move operation
  if (variables.from && variables.to) {
    return `Move "${basename(variables.from)}" failed`
  }

  // Rename operation
  if (variables.path && variables.name) {
    return `Rename "${basename(variables.path)}" failed`
  }

  // Delete or other single-path operation
  if (variables.path) {
    return `"${basename(variables.path)}"`
  }

  // Multi-path operation (e.g., bulk delete)
  if (variables.paths && variables.paths.length > 0) {
    const firstPath = variables.paths[0]
    if (variables.paths.length === 1 && firstPath) {
      return `"${basename(firstPath)}"`
    }
    return `${variables.paths.length} items`
  }

  return null
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000, // 10 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Show API errors as toast notifications
        let message = 'An error occurred'

        if (error instanceof ApiError) {
          message = error.message
        } else if (error instanceof Error) {
          message = error.message
        }

        const context = getErrorContext(mutation)
        const title = context ?? 'Error'

        showNotification({
          type: 'error',
          title,
          description: message,
        })
      },
    }),
  })
}

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create client in state to ensure it's created once per component instance
  const [queryClient] = useState(createQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
