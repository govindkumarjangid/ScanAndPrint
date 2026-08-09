import { create } from 'zustand'
import api from '../lib/axios'

export const useJobStore = create((set, get) => ({
  jobs: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: {
    totalCount: 0,
    currentPage: 1,
    totalPages: 1
  },

  fetchJobs: async (page = 1, limit = 20, status = '') => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.get(`/jobs?page=${page}&limit=${limit}&status=${status}`)
      if (res.data.success) {
        set({ 
          jobs: res.data.data.jobs,
          pagination: res.data.data.pagination
        })
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch jobs' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAnalytics: async () => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.get('/jobs/analytics')
      if (res.data.success) {
        set({ analytics: res.data.data.analytics })
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch analytics' })
    } finally {
      set({ isLoading: false })
    }
  }
}))
