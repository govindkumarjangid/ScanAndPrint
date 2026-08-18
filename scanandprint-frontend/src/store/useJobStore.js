import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useJobStore = create((set, get) => ({
  jobs: [],
  analytics: null,
  isLoading: false,
  isRefreshing: false,
  lastRefreshedAt: 0,
  currentCooldownDuration: 15,
  consecutiveRefreshCount: 0,
  error: null,
  pagination: {
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },

  fetchJobs: async (page = 1, limit = 10, status = '') => {
    try {
      set({ isLoading: true, error: null })
      const statusQuery = status && status !== 'ALL' ? `&status=${status}` : ''
      const res = await api.get(`/jobs?page=${page}&limit=${limit}${statusQuery}`)
      if (res.data.success) {
        const jobsList = res.data.data.jobs || []
        const pag = res.data.data.pagination || {
          totalCount: jobsList.length,
          currentPage: Number(page),
          totalPages: Math.ceil(jobsList.length / limit) || 1,
        }
        set({
          jobs: jobsList,
          pagination: {
            totalCount: pag.totalCount ?? jobsList.length,
            currentPage: Number(pag.currentPage || page),
            totalPages: Number(pag.totalPages || Math.ceil((pag.totalCount || jobsList.length) / limit) || 1),
            limit: Number(limit),
          },
        })
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch jobs' })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshJobs: async (page = 1, limit = 10, status = '') => {
    const now = Date.now()
    const last = get().lastRefreshedAt || 0
    const cooldownSec = get().currentCooldownDuration || 15
    const timeSinceLast = (now - last) / 1000

    if (timeSinceLast < cooldownSec) {
      const waitTime = Math.ceil(cooldownSec - timeSinceLast)
      toast(`Queue is up to date! Next refresh available in ${waitTime}s`, {
        id: 'refresh-cooldown',
        icon: '⏳',
      })
      return false
    }

    try {
      // Determine if consecutive click within 90s of previous cooldown
      const isConsecutive = last > 0 && ((now - last) < ((cooldownSec + 90) * 1000))
      const nextCount = isConsecutive ? (get().consecutiveRefreshCount + 1) : 1
      
      let nextCooldown = 15
      if (nextCount === 1) nextCooldown = 15
      else if (nextCount === 2) nextCooldown = 30
      else if (nextCount === 3) nextCooldown = 60
      else nextCooldown = 120

      set({
        isRefreshing: true,
        lastRefreshedAt: now,
        consecutiveRefreshCount: nextCount,
        currentCooldownDuration: nextCooldown,
      })

      await get().fetchJobs(page, limit, status)
      await get().fetchAnalytics()
      toast.success('Orders queue refreshed!', { id: 'refresh-success' })
      return nextCooldown
    } catch (error) {
      toast.error('Failed to refresh orders')
      return false
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

  triggerPrintNow: async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/print-now`)
      if (res.data.success) {
        toast.success('🖨️ Print command sent to hardware printer!')
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.jobId === jobId ? { ...j, status: 'DISPATCHED_TO_AGENT' } : j
          ),
        }))
        return true
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to trigger print'
      toast.error(msg)
      return false
    }
  },

  cancelJob: async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/cancel`)
      if (res.data.success) {
        toast.success('❌ Job cancelled & removed from spooler!')
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.jobId === jobId ? { ...j, status: 'PRINT_FAILED' } : j
          ),
        }))
        return true
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel job'
      toast.error(msg)
      return false
    }
  },

  deleteJob: async (jobId) => {
    try {
      const res = await api.delete(`/jobs/${jobId}`)
      if (res.data.success) {
        toast.success('🗑️ Order record deleted from database!')
        set((state) => ({
          jobs: state.jobs.filter((j) => j.jobId !== jobId && j._id !== jobId),
        }))
        return true
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete job'
      toast.error(msg)
      return false
    }
  },
}))

