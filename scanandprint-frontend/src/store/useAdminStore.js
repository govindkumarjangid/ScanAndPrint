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
  
  fetchShops: async () => {
    set({ shopsLoading: true })
    try {
      const response = await api.get('/admin/shops')
      if (response.data.success && Array.isArray(response.data.data)) {
        set({ shopsData: response.data.data })
      }
    } catch (error) {
      console.warn('Shops fetch note:', error)
    } finally {
      set({ shopsLoading: false })
    }
  },

  fetchTransactions: async () => {
    set({ transactionsLoading: true })
    try {
      const response = await api.get('/admin/transactions')
      if (response.data.success && Array.isArray(response.data.data)) {
        set({ transactionsData: response.data.data })
      }
    } catch (error) {
      console.warn('Transactions fetch note:', error)
    } finally {
      set({ transactionsLoading: false })
    }
  },

  fetchAgents: async () => {
    set({ agentsLoading: true })
    try {
      const response = await api.get('/admin/agents')
      if (response.data.success && Array.isArray(response.data.data)) {
        set({ agentsData: response.data.data })
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

