import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import HowToSetup from './pages/HowToSetup'
import About from './pages/About'
import Contact from './pages/Contact'
import Disclaimer from './pages/Disclaimer'
import RegisterShop from './pages/RegisterShop'
import ShopLogin from './pages/ShopLogin'

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

        {/* Dedicated Auth & Registration Routes */}
        <Route path="/register" element={<RegisterShop />} />
        <Route path="/shop-login" element={<ShopLogin />} />
      </Routes>
    </BrowserRouter>
  )
}