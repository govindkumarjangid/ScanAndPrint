import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import MainLayout from './layouts/MainLayout'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'

// Main Marketing Pages
import Home from './pages/Home'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import HowToSetup from './pages/HowToSetup'
import About from './pages/About'
import Contact from './pages/Contact'
import Disclaimer from './pages/Disclaimer'
import RegisterShop from './pages/RegisterShop'
import ShopLogin from './pages/ShopLogin'

// Customer Mobile Kiosk Page (QR Code Landing Flow)
import CustomerKiosk from './pages/kiosk/CustomerKiosk'

// Shop Owner Dashboard Pages
import OwnerOverview from './pages/owner/OwnerOverview'
import OwnerJobs from './pages/owner/OwnerJobs'
import OwnerPrinters from './pages/owner/OwnerPrinters'
import OwnerPricing from './pages/owner/OwnerPricing'
import OwnerQrCode from './pages/owner/OwnerQrCode'
import OwnerAgentDownload from './pages/owner/OwnerAgentDownload'
import OwnerSettings from './pages/owner/OwnerSettings'

// Super Admin Dashboard Pages
import AdminOverview from './pages/admin/AdminOverview'
import AdminShops from './pages/admin/AdminShops'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminAgents from './pages/admin/AdminAgents'
import AdminSettings from './pages/admin/AdminSettings'

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}