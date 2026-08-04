import React from 'react'
import { Link } from 'react-router'
import { Printer, Mail, Phone, Briefcase, KeyRound, ArrowRight } from 'lucide-react'

// Custom SVG Icons for Instagram & YouTube
function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0245C] text-white flex items-center justify-center shadow-lg shadow-[#F0245C]/30">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                QR Se <span className="text-[#F0245C]">Print</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed">
              Automated cyber cafe printing network — QR scan karo, print khud nikal jaye.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-[#F0245C] text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-[#F0245C] text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-stone-400 mb-1">
              Product
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#F0245C] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-[#F0245C] transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#F0245C] transition-colors">Pricing</Link>
              </li>
              <li>
                <Link to="/pricing#faq" className="hover:text-[#F0245C] transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/register" className="text-[#F0245C] font-semibold flex items-center gap-1 hover:underline">
                  Start Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F0245C] transition-colors flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Become an Agent</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-stone-400 mb-1">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/disclaimer" className="hover:text-[#F0245C] transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[#F0245C] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[#F0245C] transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[#F0245C] transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-stone-400 mb-1">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2 text-stone-300">
                <Mail className="w-4 h-4 text-[#F0245C]" />
                <a href="mailto:qrseprint@gmail.com" className="hover:text-white transition-colors">
                  qrseprint@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:8404832414" className="hover:text-white transition-colors">
                  84048 32414
                </a>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-2 hover:text-[#F0245C] transition-colors">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Business Inquiry</span>
                </Link>
              </li>
              <li>
                <Link to="/shop-login" className="flex items-center gap-2 text-[#F0245C] hover:underline font-semibold">
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
            © 2026 · Powered By QR Se Print · All rights reserved. | Developed by Rupesh Kumar Mahato
          </p>
        </div>
      </div>
    </footer>
  )
}
