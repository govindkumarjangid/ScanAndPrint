import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useAdminStore = create((set) => ({
  // States
  overviewLoading: false,
  overviewData: null,
  
  shopsLoading: false,
  shopsData: [],
  
  transactionsLoading: false,
  transactionsData: [],
  
  agentsLoading: false,
  agentsData: [],
  
  settingsLoading: false,
  settingsData: null,
  savedSuccess: false,

  // Actions
  fetchOverview: async () => {
    set({ overviewLoading: true })
    try {
      const response = await api.get('/admin/stats')
      set({ overviewData: response.data.data, overviewLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch overview data')
      set({ overviewLoading: false })
    }
  },
  
  fetchShops: async () => {
    set({ shopsLoading: true })
    try {
      const response = await api.get('/admin/shops')
      set({ shopsData: response.data.data, shopsLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch shops')
      set({ shopsLoading: false })
    }
  },

  fetchTransactions: async () => {
    set({ transactionsLoading: true })
    try {
      const response = await api.get('/admin/transactions')
      set({ transactionsData: response.data.data, transactionsLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch transactions')
      set({ transactionsLoading: false })
    }
  },

  fetchAgents: async () => {
    set({ agentsLoading: true })
    try {
      const response = await api.get('/admin/agents')
      set({ agentsData: response.data.data, agentsLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch agents')
      set({ agentsLoading: false })
    }
  },

  fetchSettings: async () => {
    set({ settingsLoading: true })
    try {
      const response = await api.get('/admin/settings')
      set({ settingsData: response.data.data, settingsLoading: false })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch settings')
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
      set({ savedSuccess: false })
      const state = useAdminStore.getState()
      const response = await api.put('/admin/settings', state.settingsData)
      set({ settingsData: response.data.data, savedSuccess: true })
      toast.success('Settings saved successfully!')
      setTimeout(() => {
        set({ savedSuccess: false })
      }, 2500)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin-login'
  }
}))
