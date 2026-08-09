import { create } from 'zustand'
import api from '../lib/axios'

export const useAuthStore = create((set, get) => ({
  // Tab state: 'login' | 'register'
  activeTab: 'login',

  // Current authenticated shop
  currentShop: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Register multi-step state: 1 | 2 | 3
  registerStep: 1,

  // Login form state
  loginEmail: '',
  loginPassword: '',
  rememberMe: true,

  // Register form state including print pricing rates
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
  },

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setRegisterStep: (step) =>
    set((state) => ({
      registerStep: Math.max(1, Math.min(3, step)),
    })),

  nextRegisterStep: () =>
    set((state) => ({
      registerStep: Math.min(3, state.registerStep + 1),
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
      },
    }),

  // Async API Actions
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/login', { email, password })
      if (res.data.success) {
        set({ currentShop: res.data.data.shop, isAuthenticated: true })
        return true
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (registerPayload) => {
    try {
      set({ isLoading: true, error: null })
      const res = await api.post('/auth/register', registerPayload)
      if (res.data.success) {
        set({ currentShop: res.data.data.shop, isAuthenticated: true })
        return true
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.warn('Logout error', e)
    } finally {
      set({ currentShop: null, isAuthenticated: false })
      window.location.href = '/shop-login'
    }
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true })
      const res = await api.get('/auth/me')
      if (res.data.success) {
        set({ currentShop: res.data.data.shop, isAuthenticated: true })
      }
    } catch (error) {
      set({ currentShop: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },
}))
