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

// Frequently Asked Questions (FAQ) - Platform Relevant
export const faqItems = [
  {
    category: 'Hardware & Setup',
    question: 'Do I need an expensive WiFi or smart printer to use Scan&Print?',
    answer:
      'No! Scan&Print works seamlessly with your existing standard USB desktop printer (Epson, HP, Canon, Brother, Ricoh, etc.). You do not need to buy any new hardware or expensive WiFi machines.',
  },
  {
    category: 'Workflow & WhatsApp',
    question: 'How does this eliminate WhatsApp file sharing on my counter?',
    answer:
      'Customers simply scan your shop counter QR code with their smartphone camera. They select and upload their document (PDF, image, or document), choose page settings, complete online UPI payment, and the document prints automatically on your machine without you touching WhatsApp.',
  },
  {
    category: 'Privacy & Security',
    question: 'Are customer documents stored or shared? How is privacy handled?',
    answer:
      'Customer privacy is 100% protected. Uploaded documents are encrypted during transfer and are permanently auto-deleted from the server immediately after printing is completed. No files remain on your PC desktop either.',
  },
  {
    category: 'Payment & Pricing',
    question: 'How do customer payments work? Is there any risk of payment loss?',
    answer:
      'Zero payment loss! The system verifies UPI payment (PhonePe, Google Pay, Paytm, BHIM) before sending the print job to your printer queue. Only successfully paid orders get printed, guaranteeing 100% advance collection.',
  },
  {
    category: 'Printer Control',
    question: 'Can I set different per-page rates for Black & White and Color prints?',
    answer:
      'Yes! From your Shop Owner Dashboard, you can map separate default printers for B&W and Color jobs and configure your exact rates per page. The platform automatically calculates the total price based on page count and color mode.',
  },
  {
    category: 'Software & Performance',
    question: 'Will the background Windows Print Agent slow down my PC?',
    answer:
      'Not at all. The Windows Print Agent is an ultra-lightweight (under 15MB) background utility designed to consume less than 1% CPU. Your computer will run fast and lag-free while running your regular daily applications.',
  },
  {
    category: 'Support & Assistance',
    question: 'What kind of support do you provide if I face any setup issue?',
    answer:
      'We provide direct 1-on-1 assistance via WhatsApp and AnyDesk remote desktop support. Our technical team helps you connect your printer, test your first print, and configure your counter QR code in under 2 minutes.',
  },
  {
    category: 'Subscription & Plans',
    question: 'Are there any hidden costs or renewal charges on the One-Time plan?',
    answer:
      'None at all! The ₹599 One-Time plan gives you lifetime access with zero monthly renewal fees, free lifetime software updates, and dedicated customer support.',
  },
]

// Pricing & Billing Specific FAQs (Used on Pricing Page)
export const pricingFaqItems = [
  {
    question: 'What is the exact difference between the Monthly ₹399 and One-Time ₹599 plans?',
    answer:
      'The Monthly plan requires a ₹399 renewal every month. The One-Time ₹599 plan gives you full lifetime access to Scan&Print with zero future renewal charges, free updates forever, and dedicated priority support.',
  },
  {
    question: 'Are there any hidden transaction cuts, commissions, or extra renewal fees on the ₹599 plan?',
    answer:
      'Zero hidden charges and 0% platform commission! 100% of customer payments go directly to your personal UPI QR / bank account without any deductions.',
  },
  {
    question: 'Can I start on the Monthly plan and upgrade to the One-Time Lifetime plan later?',
    answer:
      'Yes, you can upgrade your shop account to the One-Time lifetime plan anytime directly from your Shop Owner dashboard.',
  },
  {
    question: 'How do customers pay, and how do I receive my printing earnings?',
    answer:
      'Customers pay in advance directly through your shop UPI QR code (PhonePe, GPay, Paytm) on their phones before the document prints. Funds credit instantly into your own bank account.',
  },
  {
    question: 'Will I get an official GST invoice or payment receipt for my purchase?',
    answer:
      'Yes, an official GST tax invoice and digital payment receipt are automatically generated and sent to your registered shop email address immediately upon purchase.',
  },
  {
    question: 'What happens if I change my computer or replace my printer in the future?',
    answer:
      'Your Scan&Print Shop ID and license remain fully active. You can simply download the Print Agent on your new PC and log in with your credentials at zero extra cost.',
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
    desc: 'Today, Scan&Print is the most trusted smart printing platform powering CSC centers, xerox shops, and digital service centers across India!',
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

// Customer & Shop Owner Testimonials Data
export const testimonialData = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    role: 'Shop Owner',
    shopName: 'Shree Ganesh Xerox & Cyber Cafe',
    location: 'Near Rajasthan University, Jaipur',
    rating: 5,
    highlight: 'Saved 3+ Hours Daily in College Rush',
    avatar: 'RS',
    avatarBg: 'from-amber-500 to-rose-500',
    stats: '14,500+ Prints/mo',
    growth: '+42% Revenue',
    printerUsed: 'Epson L3210',
    setupTime: '2 Mins Setup',
    tag: 'University Zone',
    feedback:
      'College exams ke time shop pe bheed lag jati thi. Har student WhatsApp pe PDF bhejta tha aur PC hang hota tha. QR Se Print lagane ke baad ab students seedha QR scan karke khud print le lete hain. Payment bhi pehle UPI se instant aa jata hai!',
  },
  {
    id: 2,
    name: 'Vikram Patel',
    role: 'Managing Partner',
    shopName: 'Patel Digital Print & Stationery',
    location: 'Navrangpura, Ahmedabad',
    rating: 5,
    highlight: 'Zero Payment Loss & Instant Auto Print',
    avatar: 'VP',
    avatarBg: 'from-emerald-500 to-teal-600',
    stats: '18,200+ Prints/mo',
    growth: '100% UPI Advance',
    printerUsed: 'Canon G2020',
    setupTime: 'Instant Sync',
    tag: 'Commercial Hub',
    feedback:
      'Pehle kai bar customers print nikalwa kar bolte the baad me paise denge ya change nahi hai. Scan&Print me jab tak payment nahi hoti, print nikalta hi nahi. Daily cash tally karna bohot aasan ho gaya hai!',
  },
  {
    id: 3,
    name: 'Anil Kumar Gupta',
    role: 'Owner',
    shopName: 'Gupta Documentation & Xerox Hub',
    location: 'Near High Court, Patna',
    rating: 5,
    highlight: 'No Expensive WiFi Printer Needed',
    avatar: 'AG',
    avatarBg: 'from-blue-600 to-indigo-600',
    stats: '9,800+ Prints/mo',
    growth: '₹0 Hardware Cost',
    printerUsed: 'HP LaserJet 1020',
    setupTime: '3 Mins Setup',
    tag: 'Legal Docs Hub',
    feedback:
      'Mujhe laga tha iske liye koi mehnga smart printer lena padega. Lekin ye mere purane normal Epson USB printer ke sath 2 minute me connect ho gaya. Software itna lightweight hai ki PC slow bilkul nahi hota.',
  },
  {
    id: 4,
    name: 'Deepak Verma',
    role: 'Founder',
    shopName: 'Cyber World & Online Services',
    location: 'Hazratganj, Lucknow',
    rating: 5,
    highlight: 'Full Customer Privacy & Auto-Delete',
    avatar: 'DV',
    avatarBg: 'from-purple-500 to-pink-600',
    stats: '11,400+ Prints/mo',
    growth: '100% Data Privacy',
    printerUsed: 'Brother DCP-L2541',
    setupTime: 'Plug & Play',
    tag: 'Govt Form & Cyber',
    feedback:
      'Girls aur professionals ko documents WhatsApp pe share karne me hesitation hoti thi. Ab QR scan karke self-service upload karte hain aur print aate hi document server se auto-delete ho jata hai. Customers ka trust double ho gaya!',
  },
  {
    id: 5,
    name: 'Suresh Nair',
    role: 'Proprietor',
    shopName: 'City Print Studio & Photocopy',
    location: 'Koramangala, Bengaluru',
    rating: 5,
    highlight: 'Separate Rates for B&W & Color',
    avatar: 'SN',
    avatarBg: 'from-amber-600 to-orange-600',
    stats: '16,000+ Prints/mo',
    growth: '+₹22,000/mo Profit',
    printerUsed: 'Epson L8050 & L3110',
    setupTime: '2 Mins Setup',
    tag: 'IT Corridor',
    feedback:
      'B&W aur Color page ka rate dashboard se alag alag set kar diya hai. Customer jab file upload karta hai toh system khud pages count karke exact price calculate karta hai. Manual calculation ki tension hamesha ke liye khatam!',
  },
  {
    id: 6,
    name: 'Pooja Choudhary',
    role: 'Co-Owner',
    shopName: 'Mahaveer Stationery & Xerox',
    location: 'Bhawarkua, Indore',
    rating: 5,
    highlight: 'Single-Handedly Managing Rush Hours',
    avatar: 'PC',
    avatarBg: 'from-rose-500 to-red-600',
    stats: '13,200+ Prints/mo',
    growth: '3x Faster Queue',
    printerUsed: 'Canon Pixma G3010',
    setupTime: 'Instant Setup',
    tag: 'Coaching Hub',
    feedback:
      'Pehle do logo ki zaroorat padti thi—ek WhatsApp check karke print dene ke liye aur ek cash lene ke liye. Ab mai akele poori dukaan sambhal leti hu kyunki sab kuch 100% automatic chal raha hai.',
  },
]

// Default export object containing static data and icons
export default {
  icons,
  adminNavItems,
  ownerNavItems,
  navLinks,
  faqItems,
  pricingFaqItems,
  setupSteps,
  originNarrative,
  audienceList,
  featuresList,
  heroSteps,
  highlights,
  testimonialData,
  printerBrandOptions,
  printCapabilityOptions,
  aspectPresets,
  filterPresets,
}
