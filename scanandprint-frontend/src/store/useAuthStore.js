import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // Tab state: 'login' | 'register'
  activeTab: 'login',

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
}))
