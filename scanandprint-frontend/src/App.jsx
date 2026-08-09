import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import MainLayout from './layouts/MainLayout'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'
import PageLoader from './components/common/PageLoader'

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

// Lazy Loaded Super Admin Dashboard Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminShops = lazy(() => import('./pages/admin/AdminShops'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

export default function App() {
  return (
    <BrowserRouter>
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
          </Route>

          {/* Super Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}