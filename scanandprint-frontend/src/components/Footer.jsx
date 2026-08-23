import { Link } from 'react-router'
import { Printer, Mail, Phone, MapPin, Briefcase, KeyRound, ArrowRight, InstagramIcon, YoutubeIcon } from '../assets/assets';
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
                  {phone}
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
