import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

// Query Keys
export const ADMIN_KEYS = {
  all: ['admin'],
  overview: () => [...ADMIN_KEYS.all, 'overview'],
  analytics: () => [...ADMIN_KEYS.all, 'analytics'],
  shops: (params) => [...ADMIN_KEYS.all, 'shops', params],
  transactions: (params) => [...ADMIN_KEYS.all, 'transactions', params],
  devices: (params) => [...ADMIN_KEYS.all, 'devices', params],
  settings: () => [...ADMIN_KEYS.all, 'settings'],
}

// 1. Admin Platform Overview Query
export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ADMIN_KEYS.overview(),
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data.data
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

// 2. Admin Analytics Query
export function useAdminAnalyticsQuery() {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(),
    queryFn: async () => {
      const res = await api.get('/admin/analytics')
      return res.data.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// 3. Admin Shops Paginated Query
export function useAdminShopsQuery({ page = 1, limit = 10, search = '' }) {
  return useQuery({
    queryKey: ADMIN_KEYS.shops({ page, limit, search }),
    queryFn: async () => {
      const res = await api.get(`/admin/shops?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      const raw = res.data.data
      const shops = Array.isArray(raw) ? raw : raw.shops || []
      const pagination = raw.pagination || { totalCount: shops.length, currentPage: page, totalPages: 1, limit }
      return { shops, pagination }
    },
    placeholderData: (previousData) => previousData, // Seamless pagination with 0 layout shift
    staleTime: 1000 * 60 * 2,
  })
}

// 4. Admin Transactions Paginated Query
export function useAdminTransactionsQuery({ page = 1, limit = 10, search = '', status = '' }) {
  return useQuery({
    queryKey: ADMIN_KEYS.transactions({ page, limit, search, status }),
    queryFn: async () => {
      const res = await api.get(
        `/admin/transactions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`
      )
      const raw = res.data.data
      const transactions = Array.isArray(raw) ? raw : raw.transactions || []
      const pagination = raw.pagination || { totalCount: transactions.length, currentPage: page, totalPages: 1, limit }
      return { transactions, pagination }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  })
}

// 5. Admin Hardware Devices Telemetry Query
export function useAdminDevicesQuery({ page = 1, limit = 10, search = '', status = '' }) {
  return useQuery({
    queryKey: ADMIN_KEYS.devices({ page, limit, search, status }),
    queryFn: async () => {
      const [devRes, suspRes] = await Promise.all([
        api.get(`/admin/devices?page=${page}&limit=${limit}&status=${status}&search=${encodeURIComponent(search)}`),
        api.get('/admin/devices/suspicious?threshold=4'),
      ])

      const devData = devRes.data.data || {}
      const devices = devData.devices || []
      const pagination = devData.pagination || { currentPage: page, totalPages: 1, totalCount: 0 }
      const suspicious = suspRes.data.data?.suspicious || []

      return { devices, pagination, suspicious }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
  })
}

// 6. Admin System Settings Query
export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: ADMIN_KEYS.settings(),
    queryFn: async () => {
      const res = await api.get('/admin/settings')
      return res.data.data || {}
    },
    staleTime: 1000 * 60 * 10, // Settings change rarely
  })
}

// 7. Mutations with Automatic Cache Invalidation
export function useAdminMutations() {
  const queryClient = useQueryClient()

  // Extend Demo Mutation
  const extendDemoMutation = useMutation({
    mutationFn: async ({ shopId, hours = 2 }) => {
      const res = await api.post(`/admin/shops/${shopId}/extend-demo`, { hours })
      return res.data
    },
    onSuccess: (data, variables) => {
      toast.success(`Demo extended by +${variables.hours} hours!`)
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to extend demo')
    },
  })

  // Update Plan Mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ shopId, planType, days = 30, isSubscriptionActive = true }) => {
      const res = await api.put(`/admin/shops/${shopId}/plan`, { planType, days, isSubscriptionActive })
      return res.data
    },
    onSuccess: () => {
      toast.success('Shop plan updated successfully!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update plan')
    },
  })

  // Toggle Shop Status Mutation
  const toggleShopStatusMutation = useMutation({
    mutationFn: async ({ shopId, isSuspended }) => {
      const res = await api.put(`/admin/shops/${shopId}/status`, { isSuspended })
      return res.data
    },
    onSuccess: (data, variables) => {
      toast.success(`Shop ${variables.isSuspended ? 'suspended' : 'activated'} successfully!`)
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to toggle shop status')
    },
  })

  // Delete Shop Mutation
  const deleteShopMutation = useMutation({
    mutationFn: async (shopId) => {
      const res = await api.delete(`/admin/shops/${shopId}`)
      return res.data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Shop deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete shop')
    },
  })

  // Delete Transaction Mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId) => {
      const res = await api.delete(`/admin/transactions/${transactionId}`)
      return res.data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Transaction deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete transaction')
    },
  })

  // Device Approval Mutations
  const approveDeviceMutation = useMutation({
    mutationFn: async (deviceId) => {
      const res = await api.post(`/admin/devices/${deviceId}/approve`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Device approved by Super Admin!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.devices() })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.overview() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Approval failed')
    },
  })

  const rejectDeviceMutation = useMutation({
    mutationFn: async (deviceId) => {
      const res = await api.post(`/admin/devices/${deviceId}/reject`, { reason: 'Rejected by Super Admin' })
      return res.data
    },
    onSuccess: () => {
      toast.success('Device request rejected!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.devices() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Reject failed')
    },
  })

  const revokeDeviceMutation = useMutation({
    mutationFn: async (deviceId) => {
      const res = await api.post(`/admin/devices/${deviceId}/revoke`, { reason: 'Revoked by Super Admin' })
      return res.data
    },
    onSuccess: () => {
      toast.success('Device binding revoked!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.devices() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Revoke failed')
    },
  })

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsPayload) => {
      const res = await api.put('/admin/settings', settingsPayload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Settings saved and synced across network!')
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.settings() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    },
  })

  return {
    extendDemoMutation,
    updatePlanMutation,
    toggleShopStatusMutation,
    deleteShopMutation,
    deleteTransactionMutation,
    approveDeviceMutation,
    rejectDeviceMutation,
    revokeDeviceMutation,
    updateSettingsMutation,
  }
}
