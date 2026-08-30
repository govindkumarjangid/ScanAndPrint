import { QueryClient } from '@tanstack/react-query'

/**
 * Global TanStack QueryClient with optimal production caching defaults:
 * - 2 minutes stale time for smooth, instant 0ms back-and-forth page transitions
 * - 15 minutes garbage collection time
 * - Window focus refetch disabled to prevent layout shifts
 * - Single automatic retry on temporary network failure
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
