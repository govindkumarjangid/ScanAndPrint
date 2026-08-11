import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useJobStore = create((set, get) => ({
  jobs: [],
  analytics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  pagination: {
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  },

  fetchJobs: async (page = 1, limit = 20, status = '') => {
    try {
      set({ isLoading: true, error: null })
      const statusQuery = status && status !== 'ALL' ? `&status=${status}` : ''
      const res = await api.get(`/jobs?page=${page}&limit=${limit}${statusQuery}`)
      if (res.data.success) {
        set({
          jobs: res.data.data.jobs || [],
          pagination: res.data.data.pagination || { totalCount: (res.data.data.jobs || []).length, currentPage: page, totalPages: 1 },
        })
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch jobs' })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshJobs: async (status = '') => {
    try {
      set({ isRefreshing: true })
      await get().fetchJobs(1, 20, status)
      await get().fetchAnalytics()
      toast.success('Orders queue refreshed!')
    } catch (error) {
      toast.error('Failed to refresh orders')
    } finally {
      set({ isRefreshing: false })
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await api.get('/jobs/analytics')
      if (res.data.success) {
        set({ analytics: res.data.data.analytics })
      }
    } catch (error) {
      console.warn('Analytics fetch warning:', error)
    }
  },
}))

