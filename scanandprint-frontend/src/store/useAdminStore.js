import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useAdminStore = create((set, get) => ({
  // States
  overviewLoading: false,
  overviewData: {
    totalRevenue: 248500,
    totalShops: 128,
    totalPrints: 14290,
    totalAgents: 114,
  },
  recentShops: [],
  
  shopsLoading: false,
  shopsData: [],
  
  transactionsLoading: false,
  transactionsData: [],
  
  agentsLoading: false,
  agentsData: [],
  
  settingsLoading: false,
  isSavingSettings: false,
  settingsData: {
    monthlyPrice: 399,
    lifetimePrice: 599,
    maintenanceMode: false,
    demoMode: false,
  },
  savedSuccess: false,

  // Actions
  adminLogin: async (email, password) => {
    try {
      const res = await api.post('/auth/admin/login', { email, password })
      if (res.data.success) {
        const token = res.data.data.token
        localStorage.setItem('adminToken', token)
        toast.success('Admin login successful!')
        return true
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Admin login failed'
      toast.error(msg)
      throw new Error(msg)
    }
  },

  fetchOverview: async () => {
    set({ overviewLoading: true })
    try {
      const response = await api.get('/admin/stats')
      if (response.data.success && response.data.data) {
        const data = response.data.data
        // Support both flat stats object and nested { stats, recentShops }
        const stats = data.stats || data
        const recent = Array.isArray(data.recentShops) ? data.recentShops : []
        set({ overviewData: stats, recentShops: recent })
      }
    } catch (error) {
      console.warn('Overview data fetch note:', error)
    } finally {
      set({ overviewLoading: false })
    }
  },
  
  fetchShops: async (page = 1, limit = 10, search = '') => {
    set({ shopsLoading: true })
    try {
      const response = await api.get(`/admin/shops?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      if (response.data.success) {
        const raw = response.data.data
        const shops = Array.isArray(raw) ? raw : raw.shops || []
        const pagination = raw.pagination || { totalCount: shops.length, currentPage: page, totalPages: 1, limit }
        set({ shopsData: shops, shopsPagination: pagination })
      }
    } catch (error) {
      console.warn('Shops fetch note:', error)
    } finally {
      set({ shopsLoading: false })
    }
  },

  fetchTransactions: async (page = 1, limit = 10, search = '', status = '') => {
    set({ transactionsLoading: true })
    try {
      const response = await api.get(`/admin/transactions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`)
      if (response.data.success) {
        const raw = response.data.data
        const list = Array.isArray(raw) ? raw : raw.transactions || []
        const pagination = raw.pagination || { totalCount: list.length, currentPage: page, totalPages: 1, limit }
        set({ transactionsData: list, transactionsPagination: pagination })
      }
    } catch (error) {
      console.warn('Transactions fetch note:', error)
    } finally {
      set({ transactionsLoading: false })
    }
  },

  fetchAgents: async (page = 1, limit = 10, search = '', status = '') => {
    set({ agentsLoading: true })
    try {
      const response = await api.get(`/admin/agents?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`)
      if (response.data.success) {
        const raw = response.data.data
        const list = Array.isArray(raw) ? raw : raw.agents || []
        const pagination = raw.pagination || { totalCount: list.length, currentPage: page, totalPages: 1, limit }
        set({ agentsData: list, agentsPagination: pagination })
      }
    } catch (error) {
      console.warn('Agents fetch note:', error)
    } finally {
      set({ agentsLoading: false })
    }
  },

  fetchSettings: async () => {
    set({ settingsLoading: true })
    try {
      const response = await api.get('/admin/settings')
      if (response.data.success && response.data.data) {
        set({ settingsData: { ...get().settingsData, ...response.data.data } })
      }
    } catch (error) {
      console.warn('Settings fetch note:', error)
    } finally {
      set({ settingsLoading: false })
    }
  },

  updateSetting: (key, value) => {
    set((state) => ({
      settingsData: { ...state.settingsData, [key]: value }
    }))
  },

  saveSettings: async () => {
    try {
      set({ isSavingSettings: true, savedSuccess: false })
      const state = get()
      const response = await api.put('/admin/settings', state.settingsData)
      if (response.data.success && response.data.data) {
        set({ settingsData: response.data.data, savedSuccess: true })
      } else {
        set({ savedSuccess: true })
      }
      toast.success('Settings saved successfully!')
      setTimeout(() => {
        set({ savedSuccess: false })
      }, 2500)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      set({ isSavingSettings: false })
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin-login'
  }
}))

