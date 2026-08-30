import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export const OWNER_KEYS = {
  all: ['owner'],
  overview: () => [...OWNER_KEYS.all, 'overview'],
  jobs: (params) => [...OWNER_KEYS.all, 'jobs', params],
  devices: () => [...OWNER_KEYS.all, 'devices'],
  printers: () => [...OWNER_KEYS.all, 'printers'],
  pricing: () => [...OWNER_KEYS.all, 'pricing'],
  profile: () => [...OWNER_KEYS.all, 'profile'],
}

// 1. Owner Devices Query
export function useOwnerDevicesQuery() {
  return useQuery({
    queryKey: OWNER_KEYS.devices(),
    queryFn: async () => {
      const res = await api.get('/devices/my-devices')
      return res.data.data || {}
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

// 2. Owner Print Jobs Paginated Query
export function useOwnerJobsQuery({ page = 1, limit = 10, status = '', search = '' }) {
  return useQuery({
    queryKey: OWNER_KEYS.jobs({ page, limit, status, search }),
    queryFn: async () => {
      const res = await api.get(`/jobs?page=${page}&limit=${limit}&status=${status}&search=${encodeURIComponent(search)}`)
      return res.data.data || { jobs: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 1 } }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
  })
}

// 3. Owner Connected Printers Query
export function useOwnerPrintersQuery() {
  return useQuery({
    queryKey: OWNER_KEYS.printers(),
    queryFn: async () => {
      const res = await api.get('/agent/printers')
      return res.data.data || []
    },
    staleTime: 1000 * 60 * 2,
  })
}

// 4. Owner Pricing Query
export function useOwnerPricingQuery() {
  return useQuery({
    queryKey: OWNER_KEYS.pricing(),
    queryFn: async () => {
      const res = await api.get('/shop/pricing')
      return res.data.data || {}
    },
    staleTime: 1000 * 60 * 5,
  })
}
