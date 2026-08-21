import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { Toaster } from 'react-hot-toast'

import MainLayout from './layouts/MainLayout'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'
import PageLoader from './components/common/PageLoader'

// Synchronize root theme attribute for dark admin scrollbar vs light owner/marketing scrollbar
function ThemeSynchronizer() {
  const location = useLocation()
  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin')
    if (isAdmin) {
      document.documentElement.setAttribute('data-theme', 'admin')
      document.body.classList.add('admin-theme')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.body.classList.remove('admin-theme')
    }
  }, [location.pathname])
  return null
}

// Lazy Loaded Marketing Pages (Code Splitting)
const Home = lazy(() => import('./pages/Home/Home'))
const Features = lazy(() => import('./pages/Home/Features'))
const Pricing = lazy(() => import('./pages/Home/Pricing'))
const HowToSetup = lazy(() => import('./pages/Home/HowToSetup'))
const About = lazy(() => import('./pages/Home/About'))
const Contact = lazy(() => import('./pages/Home/Contact'))
const Disclaimer = lazy(() => import('./pages/Home/Disclaimer'))
const PrivacyPolicy = lazy(() => import('./pages/Home/PrivacyPolicy'))
const RefundPolicy = lazy(() => import('./pages/Home/RefundPolicy'))
const TermsConditions = lazy(() => import('./pages/Home/TermsConditions'))
const RegisterShop = lazy(() => import('./pages/RegisterShop'))
const ShopLogin = lazy(() => import('./pages/ShopLogin'))

// Lazy Loaded Customer Kiosk
const CustomerKiosk = lazy(() => import('./pages/kiosk/CustomerKiosk'))

// Lazy Loaded Shop Owner Dashboard Pages
const OwnerOverview = lazy(() => import('./pages/owner/OwnerOverview'))
const OwnerJobs = lazy(() => import('./pages/owner/OwnerJobs'))
const OwnerPrinters = lazy(() => import('./pages/owner/OwnerPrinters'))
const OwnerPricing = lazy(() => import('./pages/owner/OwnerPricing'))
const OwnerQrCode = lazy(() => import('./pages/owner/OwnerQrCode'))
const OwnerAgentDownload = lazy(() => import('./pages/owner/OwnerAgentDownload'))
const OwnerSettings = lazy(() => import('./pages/owner/OwnerSettings'))
const OwnerPaymentSetup = lazy(() => import('./pages/owner/OwnerPaymentSetup'))
const OwnerReview = lazy(() => import('./pages/owner/OwnerReview'))

// Lazy Loaded Super Admin Dashboard Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminShops = lazy(() => import('./pages/admin/AdminShops'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))

// Lazy Loaded 404
const NotFound = lazy(() => import('./pages/NotFound'))

// Adaptive Toaster: Dark mode toasts for /admin routes and original light toasts for everything else
function AdaptiveToaster() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <Toaster
      position="top-right"
      toastOptions={
        isAdmin
          ? {
              style: {
                background: '#1c1917',
                color: '#f5f5f4',
                border: '1px solid #292524',
                padding: '10px 14px',
                fontSize: '12px',
                borderRadius: '16px',
                fontWeight: '600',
                maxWidth: '340px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              },
              success: {
                style: {
                  background: '#1c1917',
                  color: '#f5f5f4',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '10px 14px',
                  fontSize: '12px',
                  borderRadius: '16px',
                  fontWeight: '600',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0c0a09',
                },
              },
              error: {
                style: {
                  background: '#1c1917',
                  color: '#f5f5f4',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  padding: '10px 14px',
                  fontSize: '12px',
                  borderRadius: '16px',
                  fontWeight: '600',
                },
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#0c0a09',
                },
              },
            }
          : {
              style: {
                background: '#ffffff',
                color: '#1c1917',
                border: '1px solid #e7e5e4',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '14px',
                fontWeight: '600',
                maxWidth: '320px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              },
              success: {
                style: {
                  background: '#ffffff',
                  color: '#1c1917',
                  border: '1px solid #dcfce7',
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '14px',
                  fontWeight: '600',
                },
              },
              error: {
                style: {
                  background: '#ffffff',
                  color: '#1c1917',
                  border: '1px solid #ffe4e6',
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '14px',
                  fontWeight: '600',
                },
              },
            }
      }
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSynchronizer />
      <AdaptiveToaster />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Website Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/how-to-setup" element={<HowToSetup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsConditions />} />
          </Route>

          {/* Customer Mobile Kiosk Routes (Scanned via QR Code) */}
          <Route path="/p/:shopCode" element={<CustomerKiosk />} />
          <Route path="/p" element={<CustomerKiosk />} />
          <Route path="/kiosk/:shopCode" element={<CustomerKiosk />} />

          {/* Auth Routes */}
          <Route path="/register" element={<RegisterShop />} />
          <Route path="/shop-login" element={<ShopLogin />} />

          {/* Shop Owner Dashboard Routes */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="dashboard" element={<OwnerOverview />} />
            <Route path="jobs" element={<OwnerJobs />} />
            <Route path="printers" element={<OwnerPrinters />} />
            <Route path="pricing" element={<OwnerPricing />} />
            <Route path="qr-code" element={<OwnerQrCode />} />
            <Route path="agent" element={<OwnerAgentDownload />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="payment-setup" element={<OwnerPaymentSetup />} />
            <Route path="review" element={<OwnerReview />} />
          </Route>

          {/* Admin Auth Route */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Super Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Not Found Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}