import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

// Helper to dynamically load Razorpay Checkout script
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

  // Job Flow State
  jobId: null,
  createdJob: null,
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
          shopCode: 'DEMO_SHOP',
          shopName: 'Sharma Cyber Cafe & Prints',
          ownerName: 'Rahul Kumar',
          address: 'Main Market, Opposite Railway Station, New Delhi',
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

  createJob: async (jobData) => {
    try {
      set({ isCreatingJob: true, error: null })
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
        set({ isPaymentVerified: true, paymentTxnId })
        return res.data.data.job
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

  // Razorpay Checkout Integration
  initiateRazorpayPayment: async ({ formData, totalAmount, customerPhone }) => {
    const { createJob, verifyPayment, shopInfo } = get()
    set({ isRazorpayLoading: true, error: null })

    try {
      // 1. Create print job in backend (uploads file to Cloudinary)
      const jobResult = await createJob(formData)
      const currentJob = jobResult?.job
      const currentJobId = currentJob?.jobId || `JOB_${Date.now().toString().slice(-6)}`

      // 2. Load Razorpay SDK Script
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check internet connection.')
      }

      // 3. Launch Razorpay Checkout Modal
      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TBRpwJ4pTFgPiY',
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          name: shopInfo?.shopName || 'QR PrintPe',
          description: `Print Job ${currentJobId} (${currentJob?.totalPages || 1} Pages)`,
          image: '/favicon.ico',
          handler: async (response) => {
            try {
              toast.success('Payment Received! Verifying & routing to printer...')
              const verifiedJob = await verifyPayment(currentJobId, response.razorpay_payment_id)
              set({ isRazorpayLoading: false, isPaymentVerified: true })
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
            color: '#e11d48', // Rose-600 Theme Color
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

  // Instant Demo Mode Bypass (for testing without real money)
  bypassPaymentDemo: async (formData) => {
    const { createJob, verifyPayment } = get()
    set({ isVerifyingPayment: true, error: null })
    try {
      const jobResult = await createJob(formData)
      const currentJobId = jobResult?.job?.jobId || `JOB_${Date.now().toString().slice(-6)}`
      const demoTxnId = `DEMO_TXN_${Date.now()}`
      const verifiedJob = await verifyPayment(currentJobId, demoTxnId)
      set({ isPaymentVerified: true, paymentTxnId: demoTxnId })
      return verifiedJob
    } catch (error) {
      console.warn('Demo bypass fallback:', error)
      const fallbackJob = { jobId: `JOB_DEMO_${Date.now().toString().slice(-6)}`, status: 'DISPATCHED_TO_AGENT' }
      set({ isPaymentVerified: true })
      return fallbackJob
    } finally {
      set({ isVerifyingPayment: false })
    }
  },

  resetJobFlow: () => {
    set({
      jobId: null,
      createdJob: null,
      upiIntentUrl: null,
      paymentTxnId: null,
      isPaymentVerified: false,
      error: null,
    })
  },
}))
