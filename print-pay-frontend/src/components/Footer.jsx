import React from 'react'
import { Link } from 'react-router'
import {
  Printer,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  ArrowRight,
  InstagramIcon,
  YoutubeIcon,
} from '../assets/assets'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">

          {/* Col 1: Brand & Tagline */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-[#F0245C]/30">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                QR Se <span className="text-brand">Print</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed">
              Automated cyber cafe printing network — Scan QR code and print automatically.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-brand text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-brand text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold tracking-wide uppercase text-xs text-stone-400 mb-1">
              Product
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/" className="hover:text-brand transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-brand transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-brand transition-colors">Pricing</Link>
              </li>
              <li>
                <Link to="/pricing#faq" className="hover:text-brand transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/register" className="text-brand font-semibold flex items-center gap-1 hover:underline">
                  Start Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>

            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold tracking-wide uppercase text-xs text-stone-400 mb-1">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/disclaimer" className="hover:text-brand transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-brand transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-brand transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-brand transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold tracking-wide uppercase text-xs  mb-1">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2 text-stone-300">
                <Mail className="w-4 h-4 text-brand" />
                <a href="mailto:qrseprint@gmail.com" className="hover:text-white transition-colors">
                  qrseprint@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:7073904473 " className="hover:text-white transition-colors">
                  7073904473
                </a>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-2 hover:text-brand transition-colors">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Business Inquiry</span>
                </Link>
              </li>
              <li>
                <Link to="/shop-login" className="flex items-center gap-2 text-brand hover:underline font-semibold">
                  <KeyRound className="w-4 h-4" />
                  <span>Shop Owner Login</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 text-center text-xs text-stone-500">
          <p>
            © 2026 · Powered By QR Se Print · All rights reserved. | Developed by Govind kumar jangid.
          </p>
        </div>
      </div>
    </footer>
  )
}
