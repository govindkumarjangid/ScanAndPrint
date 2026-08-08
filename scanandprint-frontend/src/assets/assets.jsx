import React from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  CreditCard,
  Monitor,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
  Printer,
  FileText,
  Sliders,
  SlidersHorizontal,
  QrCode,
  Download,
  Bell,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  UserPlus,
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  TrendingUp,
  MessageSquareCheck,
  Target,
  Compass,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Briefcase,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  ScanLine,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowUpRight,
  Save,
  Key,
  Copy,
  Upload,
  Plus,
  Minus,
  FileCheck,
  Smartphone,
  Crop,
  Edit3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
} from 'lucide-react'

export * from 'lucide-react'

// Custom SVG Icons for Instagram & YouTube
export function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function YoutubeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// Re-export Lucide Icons directly
export {
  ShieldCheck,
  LayoutDashboard,
  Store,
  CreditCard,
  Monitor,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
  Printer,
  FileText,
  Sliders,
  SlidersHorizontal,
  QrCode,
  Download,
  Bell,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  UserPlus,
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  TrendingUp,
  MessageSquareCheck,
  Target,
  Compass,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Briefcase,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  ScanLine,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowUpRight,
  Save,
  Key,
  Copy,
  Upload,
  Plus,
  Minus,
  FileCheck,
  Smartphone,
  Crop,
  Edit3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
}

// Export unified icons dictionary object
export const icons = {
  ShieldCheck,
  LayoutDashboard,
  Store,
  CreditCard,
  Monitor,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Search,
  Printer,
  FileText,
  Sliders,
  SlidersHorizontal,
  QrCode,
  Download,
  Bell,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  UserPlus,
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  TrendingUp,
  MessageSquareCheck,
  Target,
  Compass,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Briefcase,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  ScanLine,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowUpRight,
  Save,
  Key,
  Copy,
  Upload,
  Plus,
  Minus,
  FileCheck,
  Smartphone,
  Crop,
  Edit3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  InstagramIcon,
  YoutubeIcon,
}


// Admin Sidebar Navigation Items
export const adminNavItems = [
  { name: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Shops Management', path: '/admin/shops', icon: Store },
  { name: 'Transactions & Revenue', path: '/admin/transactions', icon: CreditCard },
  { name: 'Live Print Agents', path: '/admin/agents', icon: Monitor },
  { name: 'System Settings', path: '/admin/settings', icon: Settings },
]

// Owner Sidebar Navigation Items
export const ownerNavItems = [
  { name: 'Dashboard Overview', path: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Print Orders Queue', path: '/owner/jobs', icon: FileText },
  { name: 'Printer Setup', path: '/owner/printers', icon: Printer },
  { name: 'Print Rates & Pricing', path: '/owner/pricing', icon: IndianRupee },
  { name: 'Shop QR Code', path: '/owner/qr-code', icon: QrCode },
  { name: 'Print Agent (.exe)', path: '/owner/agent', icon: Download },
  { name: 'Shop Settings', path: '/owner/settings', icon: Settings },
]

// Main Header Navigation Links
export const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'How to Setup', path: '/how-to-setup' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

// Frequently Asked Questions (FAQ)
export const faqItems = [
  {
    question: 'Do I need to pay ₹399 every month on the Monthly plan?',
    answer:
      'Yes, the Monthly plan keeps your auto-print service active as long as the monthly subscription is renewed.',
  },
  {
    question: 'Are there any hidden charges on the ₹599 One-Time plan?',
    answer:
      'Absolutely none! The One-Time plan grants lifetime access including all future software updates with zero renewal fees.',
  },
  {
    question: 'Can I upgrade from Monthly to the One-Time Lifetime plan later?',
    answer:
      'Yes, you can upgrade your account to the One-Time lifetime plan anytime from your Shop Owner Login dashboard.',
  },
  {
    question: 'How will I receive setup assistance?',
    answer:
      'Our dedicated team guides you 1-on-1 via WhatsApp and AnyDesk remote desktop support.',
  },
  {
    question: 'Will I get help setting up online payment gateways?',
    answer:
      'Yes! On the One-Time ₹599 plan, we assist you in setting up direct UPI payments via PhonePe, Google Pay, or Paytm.',
  },
]

// How to Setup Stepper Data
export const setupSteps = [
  {
    step: 1,
    title: 'Register Your Shop',
    desc: 'Fill in your basic shop details (Name, Phone, Email, Password, and Printer Brand) in our 2-minute registration form.',
    icon: UserPlus,
    badgeColor: 'bg-amber-400 text-stone-900 ring-4 ring-amber-100/90 shadow-lg',
    isLeftCard: true,
  },
  {
    step: 2,
    title: 'Download Print Agent Software',
    desc: 'Log in to your shop dashboard and download the lightweight Print Agent application for Windows.',
    icon: Download,
    badgeColor: 'bg-brand text-white ring-4 ring-rose-100/90 shadow-lg',
    isLeftCard: false,
  },
  {
    step: 3,
    title: 'Map Your Printers (B&W / Color)',
    desc: 'The Print Agent automatically detects your connected Black & White and Color printers.',
    icon: Printer,
    badgeColor: 'bg-amber-400 text-stone-900 ring-4 ring-amber-100/90 shadow-lg',
    isLeftCard: true,
  },
  {
    step: 4,
    title: 'Get Your Unique Shop QR Code',
    desc: 'Download and print your high-resolution customized QR code containing your unique Shop ID.',
    icon: QrCode,
    badgeColor: 'bg-brand text-white ring-4 ring-rose-100/90 shadow-lg',
    isLeftCard: false,
  },
  {
    step: 5,
    title: 'Display the QR at Your Counter',
    desc: 'Place the printed QR code prominently at your counter, desk, or near your printing machines.',
    icon: Monitor,
    badgeColor: 'bg-amber-400 text-stone-900 ring-4 ring-amber-100/90 shadow-lg',
    isLeftCard: true,
  },
  {
    step: 6,
    title: 'Start Receiving Auto-Print Orders!',
    desc: 'Customers scan the QR code from their mobile, make online payment, and pages automatically print out!',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-500 text-white ring-4 ring-emerald-100/90 shadow-lg',
    isLeftCard: false,
  },
]

// Origin Narrative for About Page
export const originNarrative = [
  {
    step: '1',
    title: 'Starting a Local Cyber Café',
    desc: 'We started a small cyber café and xerox shop in a local town. Customers visited daily for online form submissions and document printouts.',
  },
  {
    step: '2',
    title: 'Daily Crowd & Frustration',
    desc: '30-40 customers would crowd the counter shouting, "Brother, I sent the file on WhatsApp, please print it." Manually opening WhatsApp Web, downloading files, and issuing print commands consumed all our time.',
  },
  {
    step: '3',
    title: 'Developing an Automated System',
    desc: 'To eliminate this bottleneck, we engineered a smart QR printing system that allowed customers to scan, pay online, and auto-print directly from their phones.',
  },
  {
    step: '4',
    title: 'Refinement from Real Feedback',
    desc: 'Nearby shop owners requested the system for their own centers. Based on their input, we added Black & White vs Color printer mapping and instant custom QR branding.',
  },
  {
    step: '5',
    title: 'Nationwide Launch for All Shops',
    desc: 'Today, QR Se Print is the most trusted smart printing platform powering CSC centers, xerox shops, and digital service centers across India!',
  },
]

// Target Audience List (About page & AudienceGrid Coverflow)
export const audienceList = [
  { icon: Store, title: 'Cyber Cafes', desc: 'Eliminate long queues with instant automatic printing.' },
  { icon: Printer, title: 'Print & Xerox Shops', desc: 'Customers print photos and PDFs directly from their phones.' },
  { icon: ShieldCheck, title: 'CSC Centers', desc: 'Process government digital services fast and hassle-free.' },
  { icon: Building2, title: 'Digital Service Centres', desc: 'Direct phone-to-printer workflow without sharing WhatsApp.' },
  { icon: GraduationCap, title: 'Schools & Colleges', desc: 'Quick student notes and admit card printouts.' },
  { icon: BookOpen, title: 'Coaching Institutes', desc: 'Instant assignment and test paper printing.' },
  { icon: Layers, title: 'Libraries & Offices', desc: 'Convenient self-service document printing.' },
  { icon: TrendingUp, title: 'Small & Medium Businesses', desc: 'Digital payments and auto-printing combined.' },
]

// Features List (Features page)
export const featuresList = [
  {
    icon: QrCode,
    title: 'QR-Based Smart Printing',
    desc: 'Customers scan your counter QR code, upload files, complete payment, and documents print automatically.',
    highlight: 'Scan → Upload → Pay → Auto Print',
  },
  {
    icon: Printer,
    title: 'Any Printer Supported',
    desc: 'Compatible with all standard USB desktop printers. No expensive WiFi or smart printers required.',
    highlight: 'No WiFi Printer Needed',
  },
  {
    icon: Download,
    title: 'Easy Software Installation',
    desc: 'Simple 2-step setup. Install the lightweight Windows application and log in with your Shop ID.',
    highlight: '2-Minute Setup',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Document Processing',
    desc: 'Customer files are permanently auto-deleted from the system right after printing. 100% privacy guaranteed.',
    highlight: 'Auto-Deleted After Printing',
  },
  {
    icon: LayoutDashboard,
    title: 'Shop Owner Dashboard',
    desc: 'Track total print orders, daily revenue, and active printer status anytime from mobile or desktop.',
    highlight: 'Real-Time Analytics',
  },
  {
    icon: SlidersHorizontal,
    title: 'Separate B&W & Color Printers',
    desc: 'Configure separate default printers for Black & White and Color jobs with custom rates per page.',
    highlight: 'Custom Per-Page Rates',
  },
  {
    icon: TrendingUp,
    title: 'Order & Revenue Management',
    desc: 'Comprehensive earnings breakdown, transaction history, and direct payment gateway settlements.',
    highlight: 'Transparent Tracking',
  },
  {
    icon: Zap,
    title: 'Super Fast Performance',
    desc: 'Lightweight background application ensures zero PC lag while processing background print jobs.',
    highlight: 'Zero PC Lag',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates & Enhancements',
    desc: 'Receive automated software updates with new features, speed optimizations, and security patches.',
    highlight: 'Lifetime Updates',
  },
]

// Hero Section 4 Workflow Steps
export const heroSteps = [
  {
    id: 0,
    num: '01',
    label: 'Scan QR Code',
    subtitle: 'Phone Camera / UPI',
    icon: ScanLine,
  },
  {
    id: 1,
    num: '02',
    label: 'Upload File',
    subtitle: 'PDF, Image, Docs',
    icon: UploadCloud,
  },
  {
    id: 2,
    num: '03',
    label: 'Instant UPI Pay',
    subtitle: 'GPay / PhonePe / Paytm',
    icon: CreditCard,
  },
  {
    id: 3,
    num: '04',
    label: 'Auto Print!',
    subtitle: 'Zero Manual Work',
    icon: Printer,
  },
]

// Feature Highlight Snippets
export const highlights = [
  {
    icon: QrCode,
    title: 'Scan → Upload → Pay → Auto Print',
    desc: 'Customers scan your counter QR code, upload files, and pay online — documents print automatically on your PC!',
  },
  {
    icon: Printer,
    title: 'No WiFi Printer Required',
    desc: 'Works seamlessly with your existing standard USB or desktop printer. No expensive hardware needed.',
  },
  {
    icon: ShieldCheck,
    title: 'Auto-Deleted Private Files',
    desc: 'Customer files are automatically deleted immediately after printing. 100% data privacy and trust.',
  },
]

// Printer Brands & Capability Options (used in Shop Registration)
export const printerBrandOptions = [
  'Epson',
  'HP',
  'Canon',
  'Brother',
  'Ricoh',
  'Other',
]

export const printCapabilityOptions = [
  { value: 'Both', label: 'Both Black & White + Color Printers' },
  { value: 'BW', label: 'Black & White Only' },
  { value: 'Color', label: 'Color Printer Only' },
]

// Image Editor Presets
export const aspectPresets = [
  { label: 'Free', value: null },
  { label: 'Square (1:1)', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: 'A4 Paper', value: 0.707 },
  { label: 'Passport', value: 0.77 },
]

export const filterPresets = [
  { name: 'Normal', brightness: 100, contrast: 100, saturation: 100, isGrayscale: false, isSepia: false },
  { name: 'B&W Mono', brightness: 105, contrast: 120, saturation: 0, isGrayscale: true, isSepia: false },
  { name: 'Vintage Sepia', brightness: 100, contrast: 110, saturation: 90, isGrayscale: false, isSepia: true },
  { name: 'Doc Scan', brightness: 115, contrast: 135, saturation: 80, isGrayscale: false, isSepia: false },
  { name: 'Vivid Color', brightness: 105, contrast: 115, saturation: 140, isGrayscale: false, isSepia: false },
]

// Default export object containing static data and icons
export default {
  icons,
  adminNavItems,
  ownerNavItems,
  navLinks,
  faqItems,
  setupSteps,
  originNarrative,
  audienceList,
  featuresList,
  heroSteps,
  highlights,
  printerBrandOptions,
  printCapabilityOptions,
  aspectPresets,
  filterPresets,
}
