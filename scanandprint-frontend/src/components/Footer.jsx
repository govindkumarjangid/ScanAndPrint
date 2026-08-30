import { Link } from 'react-router'
import { Mail, Phone, MapPin, Briefcase, KeyRound, ArrowRight } from '../assets/assets';
import { Logo } from "./ui/Logo";
import { useAuthStore } from '../store/useAuthStore';

export default function Footer() {
  const { publicSettings } = useAuthStore()
  const email = publicSettings?.supportEmail || 'scanqrandprint@gmail.com'
  const phone = publicSettings?.supportPhone || '+91 7073904473'
  const address = publicSettings?.supportAddress || 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015'
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">

          {/* Brand & Tagline */}
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-stone-400 text-sm leading-relaxed">
              Automated smart print network — Scan QR code and print documents automatically.
            </p>

            {/* Authentic Brand Colored Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@scanandprint"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(255,0,0,0.35)] hover:shadow-[0_6px_20px_rgba(255,0,0,0.6)] hover:scale-108 transition-all cursor-pointer"
                aria-label="YouTube - @scanandprint"
                title="Scan&Print on YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/scanandprint.in"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(24,119,242,0.35)] hover:shadow-[0_6px_20px_rgba(24,119,242,0.6)] hover:scale-108 transition-all cursor-pointer"
                aria-label="Facebook - scanandprint.in"
                title="Scan&Print on Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/scanandprint.in/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(220,39,67,0.35)] hover:shadow-[0_6px_20px_rgba(220,39,67,0.6)] hover:scale-108 transition-all cursor-pointer"
                aria-label="Instagram - scanandprint.in"
                title="Scan&Print on Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold tracking-wide uppercase text-xs text-stone-400 mb-1">
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

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold tracking-wide uppercase text-xs text-stone-400 mb-1">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-brand transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-brand transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-brand transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold tracking-wide uppercase text-xs  mb-1">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2 text-stone-300">
                <Mail className="w-4 h-4 text-brand" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                  {phone},
                </a>
                <a href={`tel:+91-9257918623`} className="hover:text-white transition-colors">
                  +91 9257918623
                </a>
              </li>
              {address && (
                <li className="flex items-start gap-2 text-stone-400 text-xs leading-relaxed max-w-xs">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              )}
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
            © 2026 · Powered By Scan&Print · All rights reserved. | Developed by Govind kumar jangid.
          </p>
        </div>
      </div>
    </footer>
  )
}
