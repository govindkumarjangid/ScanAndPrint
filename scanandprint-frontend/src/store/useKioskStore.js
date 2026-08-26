import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const useKioskStore = create((set, get) => ({
  shopInfo: null,
  isLoadingShop: false,
  isCreatingJob: false,
  isVerifyingPayment: false,
  isRazorpayLoading: false,
  error: null,

  jobId: null,
  createdJob: null,
  tempId: null,
  isPreUploading: false,
  upiIntentUrl: null,
  paymentTxnId: null,
  isPaymentVerified: false,

  fetchShopInfo: async (shopCode) => {
    try {
      set({ isLoadingShop: true, error: null })
      const res = await api.get(`/kiosk/${shopCode}`)
      if (res.data.success && res.data.data?.shop) {
        set({ shopInfo: res.data.data.shop })
        return res.data.data.shop
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load shop info'
      set({ error: msg })
      if (shopCode === 'DEMO_SHOP') {
        const fallbackShop = {
          shopCode: 'GOVIND_SHOP',
          shopName: 'Govind Cyber Cafe & Prints',
          ownerName: 'Govind Kumar',
          address: 'Main Market, Opposite Railway Station, Jaipur',
          bwRate: 5,
          colorRate: 10,
          isOnline: true,
          printerBrand: 'Epson L3210 Series',
        }
        set({ shopInfo: fallbackShop })
        return fallbackShop
      } else {
        set({ shopInfo: null })
        return null
      }
    } finally {
      set({ isLoadingShop: false })
    }
  },

  preUploadFile: async (file) => {
    if (!file) return null
    try {
      set({ isPreUploading: true })
      const formData = new FormData()
      formData.append('file', file, file.name || 'document.pdf')
      formData.append('originalFileName', file.name || 'document.pdf')

      const res = await api.post('/kiosk/pre-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success && res.data.data?.tempId) {
        const tempId = res.data.data.tempId
        set({ tempId })
        return tempId
      }
    } catch (err) {
      console.warn('[Pre-upload Notice]: Direct checkout fallback active:', err.message)
      return null
    } finally {
      set({ isPreUploading: false })
    }
  },

  quickDispatchJob: async (formData) => {
    try {
      set({ isVerifyingPayment: true, error: null })
      const { tempId } = get()
      if (tempId && formData instanceof FormData && !formData.has('tempId')) {
        formData.append('tempId', tempId)
      }

      const res = await api.post('/kiosk/quick-dispatch', formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })

      if (res.data.success) {
        const job = res.data.data.job
        set({
          jobId: job?.jobId,
          createdJob: job,
          isPaymentVerified: true,
          paymentTxnId: job?.paymentTxnId,
        })
        return job
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to dispatch print job'
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ isVerifyingPayment: false })
    }
  },

  createJob: async (jobData) => {
    try {
      set({ isCreatingJob: true, error: null })
      const { tempId } = get()
      if (tempId && jobData instanceof FormData && !jobData.has('tempId')) {
        jobData.append('tempId', tempId)
      }

      const res = await api.post('/kiosk/create-job', jobData, {
        headers: jobData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      if (res.data.success) {
        const job = res.data.data.job
        const upiIntentUrl = res.data.data.upiIntentUrl
        set({
          jobId: job?.jobId || `JOB_${Date.now().toString().slice(-6)}`,
          createdJob: job,
          upiIntentUrl,
        })
        return res.data.data
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create print job'
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ isCreatingJob: false })
    }
  },

  verifyPayment: async (jobId, paymentTxnId = null) => {
    try {
      set({ isVerifyingPayment: true, error: null })
      const res = await api.post('/kiosk/payment/verify', { jobId, paymentTxnId })
      if (res.data.success) {
        const verifiedJob = res.data.data.job
        set({ isPaymentVerified: true, paymentTxnId, createdJob: verifiedJob })
        return verifiedJob
      }
    } catch (error) {
      console.warn('Payment verify error:', error)
      const msg = error.response?.data?.message || 'Payment verification failed'
      set({ error: msg })
      throw new Error(msg)
    } finally {
      set({ isVerifyingPayment: false })
    }
  },

  initiateRazorpayPayment: async ({ formData, totalAmount, customerPhone }) => {
    const { createJob, verifyPayment, shopInfo } = get()
    set({ isRazorpayLoading: true, error: null })

    try {
      if (formData instanceof FormData) {
        formData.set('paymentMethod', 'RAZORPAY')
      }
      const jobResult = await createJob(formData)
      const currentJob = jobResult?.job
      const currentJobId = currentJob?.jobId || `JOB_${Date.now().toString().slice(-6)}`

      const isLoaded = await loadRazorpayScript()
      if (!isLoaded)
        throw new Error('Razorpay SDK failed to load. Please check internet connection.')

      const activeRazorpayKey = shopInfo?.paymentSettings?.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TBRpwJ4pTFgPiY'

      return new Promise((resolve, reject) => {
        const options = {
          key: activeRazorpayKey,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: shopInfo?.shopName || 'Scan&Print',
          description: `Print Job ${currentJobId} (${currentJob?.totalPages || 1} Pages)`,
          image: '/favicon.ico',
          handler: async (response) => {
            try {
              toast.success('Payment Received! Routing to printer in real-time...')
              const verifiedJob = await verifyPayment(currentJobId, response.razorpay_payment_id)
              set({
                isRazorpayLoading: false,
                isPaymentVerified: true,
                paymentTxnId: response.razorpay_payment_id,
                createdJob: verifiedJob || currentJob,
              })
              resolve(verifiedJob)
            } catch (err) {
              toast.error('Payment verification failed')
              set({ isRazorpayLoading: false })
              reject(err)
            }
          },
          prefill: {
            contact: customerPhone || '',
          },
          notes: {
            jobId: currentJobId,
            shopCode: shopInfo?.shopCode || 'SHOP',
          },
          theme: {
            color: '#F0245C',
          },
          modal: {
            ondismiss: () => {
              set({ isRazorpayLoading: false })
              toast('Payment cancelled', { icon: 'ℹ️' })
              reject(new Error('Payment cancelled by user'))
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          toast.error(`Payment Failed: ${response.error?.description || 'Unknown error'}`)
          set({ isRazorpayLoading: false })
          reject(new Error(response.error?.description || 'Payment Failed'))
        })
        rzp.open()
      })
    } catch (error) {
      set({ isRazorpayLoading: false })
      throw error
    }
  },

  payAtCounter: async (formData) => {
    const { quickDispatchJob } = get()
    if (formData instanceof FormData) {
      formData.set('paymentMethod', 'CASH_COUNTER')
    }
    set({ isPaymentVerified: false, paymentTxnId: null })
    return await quickDispatchJob(formData)
  },

  bypassPaymentDemo: async (formData) => {
    const { quickDispatchJob } = get()
    if (formData instanceof FormData) {
      formData.set('paymentMethod', 'DEMO_BYPASS')
    }
    set({ isPaymentVerified: true, paymentTxnId: 'DEMO_PAID' })
    return await quickDispatchJob(formData)
  },

  resetJobFlow: () => {
    set({
      jobId: null,
      createdJob: null,
      tempId: null,
      isPreUploading: false,
      upiIntentUrl: null,
      paymentTxnId: null,
      isPaymentVerified: false,
      error: null,
    })
  },
}))
