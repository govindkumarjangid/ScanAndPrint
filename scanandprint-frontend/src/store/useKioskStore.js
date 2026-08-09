import { create } from 'zustand'
import api from '../lib/axios'

export const useKioskStore = create((set, get) => ({
  shopInfo: null,
  isLoading: false,
  error: null,
  
  // Job Flow State
  jobId: null,
  upiIntentUrl: null,
  paymentTxnId: null,

  fetchShopInfo: async (shopCode) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.get(`/kiosk/${shopCode}`)
      if (res.data.success) {
        set({ shopInfo: res.data.data.shop })
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load shop info' })
    } finally {
      set({ isLoading: false })
    }
  },

  createJob: async (jobData) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/kiosk/create-job', jobData)
      if (res.data.success) {
        set({ 
          jobId: res.data.data.job.jobId,
          upiIntentUrl: res.data.data.upiIntentUrl 
        })
        return res.data.data
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create job' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  verifyPayment: async (jobId, paymentTxnId = null) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/kiosk/payment/verify', { jobId, paymentTxnId })
      if (res.data.success) {
        return res.data.data.job
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Payment verification failed' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  }
}))
