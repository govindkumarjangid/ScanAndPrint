import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const getInitialShop = () => {
  try {
    const saved = localStorage.getItem('shopData')
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    return null
  }
}

const initialShop = getInitialShop()
const initialToken = localStorage.getItem('shopToken')

export const useAuthStore = create((set, get) => ({

  activeTab: 'login',

  currentShop: initialShop,
  isAuthenticated: !!initialToken || !!initialShop,
  isLoading: false,
  isSavingRates: false,
  isSavingPrinters: false,
  isSavingProfile: false,
  isUpdatingPassword: false,
  isSavingPayment: false,
  isSubmittingReview: false,
  error: null,

  registerStep: 1,

  publicSettings: {
    monthlyPrice: 299,
    monthlyOriginalPrice: 499,
    yearlyPrice: 799,
    yearlyOriginalPrice: 3999,
    demoMode: true,
    demoDurationHours: 2,
    filePurgeMinutes: 60,
    supportEmail: 'scanqrandprint@gmail.com',
    supportPhone: '+91 7073904473',
    supportAddress: 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015',
    systemNotice: '',
    maintenanceMode: false,
  },
  isFetchingSettings: false,

  loginEmail: '',
  loginPassword: '',
  rememberMe: true,

  registerData: {
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    shopAddress: '',
    pincode: '',
    cityState: '',
    printerBrand: 'Epson',
    printType: 'Both',
    bwRate: 10,
    colorRate: 10,
    hardwareReady: true,
    planType: 'MONTHLY_299',
  },

  _lastSettingsFetch: 0,
  _lastProfileFetch: 0,

  fetchPublicSettings: async (force = false) => {
    const now = Date.now()
    const state = get()
    // Prevent overfetching if fetched in last 5 minutes unless forced
    if (!force && state._lastSettingsFetch && now - state._lastSettingsFetch < 300000) {
      return state.publicSettings
    }
    if (state.isFetchingSettings) return state.publicSettings

    try {
      set({ isFetchingSettings: true })
      const res = await api.get('/auth/settings')
      if (res.data.success && res.data.data) {
        const d = res.data.data
        const newSettings = {
          monthlyPrice: d.monthlyPrice ?? 299,
          monthlyOriginalPrice: d.monthlyOriginalPrice ?? 499,
          yearlyPrice: d.yearlyPrice ?? 799,
          yearlyOriginalPrice: d.yearlyOriginalPrice ?? 3999,
          demoMode: d.demoMode ?? true,
          demoDurationHours: d.demoDurationHours ?? 2,
          filePurgeMinutes: d.filePurgeMinutes ?? 60,
          supportEmail: d.supportEmail || 'scanqrandprint@gmail.com',
          supportPhone: d.supportPhone || '+91 7073904473',
          supportAddress: d.supportAddress || 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015',
          systemNotice: d.systemNotice || '',
          maintenanceMode: Boolean(d.maintenanceMode),
        }
        set({
          _lastSettingsFetch: Date.now(),
          publicSettings: newSettings,
        })
        return newSettings
      }
    } catch (error) {
      console.warn('Failed to fetch public settings', error)
    } finally {
      set({ isFetchingSettings: false })
    }
  },

  setPublicSettings: (newSettings) => {
    set((state) => ({
      publicSettings: {
        ...state.publicSettings,
        ...newSettings,
      },
    }))
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTab: (tab) => set({ activeTab: tab, error: null }),

  setRegisterStep: (step) =>
    set((state) => ({
      registerStep: Math.max(1, Math.min(4, step)),
    })),

  nextRegisterStep: () =>
    set((state) => ({
      registerStep: Math.min(4, state.registerStep + 1),
    })),

  prevRegisterStep: () =>
    set((state) => ({
      registerStep: Math.max(1, state.registerStep - 1),
    })),

  setLoginEmail: (email) => set({ loginEmail: email }),
  setLoginPassword: (password) => set({ loginPassword: password }),
  setRememberMe: (val) => set({ rememberMe: val }),

  updateRegisterData: (fields) =>
    set((state) => ({
      registerData: { ...state.registerData, ...fields },
    })),

  resetRegisterForm: () =>
    set({
      registerStep: 1,
      registerData: {
        fullName: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        shopAddress: '',
        pincode: '',
        cityState: '',
        printerBrand: 'Epson',
        printType: 'Both',
        bwRate: 5,
        colorRate: 10,
        hardwareReady: true,
        planType: 'MONTHLY_299',
      },
    }),

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/login', { email, password })
      if (res.data.success) {
        const { shop, token } = res.data.data
        if (token) localStorage.setItem('shopToken', token)
        if (shop) localStorage.setItem('shopData', JSON.stringify(shop))
        set({ currentShop: shop, isAuthenticated: true })
        return true
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed'
      set({ error: errorMsg })
      throw new Error(errorMsg)
    } finally {
      set({ isLoading: false })
    }
  },

  registerInit: async (registerPayload) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/register-init', registerPayload)
      if (res.data.success) {
        const data = res.data.data
        if (data.isFreeTrial && (data.token || data.accessToken)) {
          const token = data.token || data.accessToken
          localStorage.setItem('shopToken', token)
          if (data.shop) localStorage.setItem('shopData', JSON.stringify(data.shop))
          set({ currentShop: data.shop, isAuthenticated: true })
        }
        return data
      }
      throw new Error(res.data.message || 'Failed to initialize registration')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed'
      set({ error: errorMsg })
      throw new Error(errorMsg)
    } finally {
      set({ isLoading: false })
    }
  },

  verifySubscriptionPayment: async (paymentPayload) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/verify-subscription-payment', paymentPayload)
      if (res.data.success) {
        const { shop, token } = res.data.data
        if (token) localStorage.setItem('shopToken', token)
        if (shop) localStorage.setItem('shopData', JSON.stringify(shop))
        set({ currentShop: shop, isAuthenticated: true })
        return shop
      }
      throw new Error(res.data.message || 'Subscription payment verification failed')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Payment verification failed'
      set({ error: errorMsg })
      throw new Error(errorMsg)
    } finally {
      set({ isLoading: false })
    }
  },

  createSubscriptionOrder: async (planType = 'MONTHLY_299', shopId) => {
    try {
      set({ isLoading: true, error: null })
      const currentShopId = shopId || get().currentShop?._id
      const res = await api.post('/auth/create-subscription-order', {
        planType,
        shopId: currentShopId,
      })
      if (res.data.success) {
        return res.data.data
      }
      throw new Error(res.data.message || 'Failed to generate renewal order')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create subscription order'
      set({ error: errorMsg })
      throw new Error(errorMsg)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (registerPayload) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/register', registerPayload)
      if (res.data.success) {
        const { shop, token } = res.data.data
        if (token) localStorage.setItem('shopToken', token)
        if (shop) localStorage.setItem('shopData', JSON.stringify(shop))
        set({ currentShop: shop, isAuthenticated: true })
        return true
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed'
      set({ error: errorMsg })
      throw new Error(errorMsg)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.warn('Logout warning', e)
    } finally {
      localStorage.removeItem('shopToken')
      localStorage.removeItem('shopData')
      set({ currentShop: null, isAuthenticated: false })
      window.location.href = '/shop-login'
    }
  },

  fetchProfile: async (force = false) => {
    const now = Date.now()
    const state = get()
    if (!force && state._lastProfileFetch && now - state._lastProfileFetch < 10000) {
      return state.currentShop
    }
    try {
      set({ isLoading: true })
      const res = await api.get('/auth/me')
      if (res.data.success && res.data.data?.shop) {
        const shop = res.data.data.shop
        if (shop.isSuspended) {
          toast.error('⚠️ Your shop account has been suspended by Administrator.', { id: 'susp-logout' })
          get().logout()
          return null
        }
        localStorage.setItem('shopData', JSON.stringify(shop))
        set({ currentShop: shop, isAuthenticated: true, _lastProfileFetch: Date.now() })
        return shop
      }
    } catch (error) {
      if (error.response?.status === 403 && String(error.response?.data?.message || '').toLowerCase().includes('suspend')) {
        toast.error('⚠️ Your shop account has been suspended by Administrator.', { id: 'susp-logout' })
        get().logout()
      } else if (error.response?.status === 401 && !localStorage.getItem('shopData')) {
        set({ currentShop: null, isAuthenticated: false })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (profileData) => {
    try {
      set({ isSavingProfile: true })
      const res = await api.put('/auth/profile', profileData)
      if (res.data.success) {
        const updatedShop = res.data.data.shop
        localStorage.setItem('shopData', JSON.stringify(updatedShop))
        set({ currentShop: updatedShop })
        toast.success('Shop profile updated successfully!')
        return updatedShop
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isSavingProfile: false })
    }
  },

  updateRates: async (ratesData) => {
    try {
      set({ isSavingRates: true })
      const res = await api.put('/auth/rates', ratesData)
      if (res.data.success) {
        const updatedShop = res.data.data.shop
        const merged = { ...get().currentShop, ...updatedShop, ...ratesData }
        localStorage.setItem('shopData', JSON.stringify(merged))
        set({ currentShop: merged })
        toast.success('Print rates updated successfully!')
        return merged
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update rates'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isSavingRates: false })
    }
  },

  updatePrinters: async (printerData) => {
    try {
      set({ isSavingPrinters: true })
      const res = await api.put('/auth/printers', printerData)
      if (res.data.success) {
        const updatedShop = res.data.data.shop
        const merged = { ...get().currentShop, ...updatedShop, ...printerData }
        localStorage.setItem('shopData', JSON.stringify(merged))
        set({ currentShop: merged })
        toast.success('Printers mapped successfully!')
        return merged
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update printers'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isSavingPrinters: false })
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ isUpdatingPassword: true })
      const res = await api.put('/auth/change-password', { currentPassword, newPassword })
      if (res.data.success) {
        toast.success('Password updated successfully!')
        return true
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isUpdatingPassword: false })
    }
  },

  updatePaymentSettings: async (paymentData) => {
    try {
      set({ isSavingPayment: true })
      const res = await api.put('/auth/payment-settings', paymentData)
      if (res.data.success) {
        const updatedShop = res.data.data.shop
        localStorage.setItem('shopData', JSON.stringify(updatedShop))
        set({ currentShop: updatedShop })
        toast.success('Payment settings saved successfully!')
        return updatedShop
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save payment settings'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isSavingPayment: false })
    }
  },

  submitReview: async (reviewData) => {
    try {
      set({ isSubmittingReview: true })
      const res = await api.post('/auth/review', reviewData)
      if (res.data.success) {
        toast.success('Thank you for your valuable feedback!')
        return true
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit review'
      toast.error(msg)
      throw new Error(msg)
    } finally {
      set({ isSubmittingReview: false })
    }
  },
}))
