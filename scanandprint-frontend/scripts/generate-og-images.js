import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const ogOutputDir = path.resolve(projectRoot, 'public/images/og')
const logoSvgPath = path.resolve(projectRoot, 'public/svgs/logo.svg')

if (!fs.existsSync(ogOutputDir)) {
  fs.mkdirSync(ogOutputDir, { recursive: true })
}

const logoSvgRaw = fs.readFileSync(logoSvgPath, 'utf-8')
const logoInnerSvg = logoSvgRaw
  .replace(/<svg[^>]*>/i, '')
  .replace(/<\/svg>/i, '')
  .trim()

const ogCards = [
  {
    fileName: 'og-home.png',
    badge: "INDIA'S #1 SMART PRINTING NETWORK",
    title: 'Automatic QR Code Printing for Cyber Cafés & Shops',
    description: 'Customers scan counter QR code, upload documents, pay via UPI, and print in seconds.',
    features: ['⚡ 2-Minute Setup', '🖨️ Works with Any USB Printer', '💳 Direct UPI Payments'],
    accentColor: '#e11d48',
  },
  {
    fileName: 'og-features.png',
    badge: 'POWERFUL SAAS CAPABILITIES',
    title: 'Smart Features: Queue-Free Automated Printing',
    description: 'Instant QR kiosk, desktop printer agent, multi-printer load balancing, and instant automated settlements.',
    features: ['📱 Mobile Web Kiosk', '🔄 Live Desktop Agent', '🔒 Zero-Storage Privacy'],
    accentColor: '#3b82f6',
  },
  {
    fileName: 'og-pricing.png',
    badge: 'TRANSPARENT & AFFORDABLE PRICING',
    title: '100% Free 48-Hour Demo & Flexible Shop Plans',
    description: 'Experience unlimited automated printing. Test live with 48-Hour Free Demo or choose Monthly/Yearly.',
    features: ['🎁 Free 48-Hr Full Demo', '🚀 Monthly Plan ₹299', '⭐ Yearly 78% Off ₹799'],
    accentColor: '#f59e0b',
  },
  {
    fileName: 'og-how-to-setup.png',
    badge: 'EASY HARDWARE COMPATIBILITY GUIDE',
    title: 'How to Setup Scan&Print in 2 Minutes',
    description: 'Connect your existing Epson, HP, Canon, Brother, or TVS printer with zero hardware changes.',
    features: ['1️⃣ Register Shop', '2️⃣ Download Agent', '3️⃣ Pair Printer', '4️⃣ Place QR Standee'],
    accentColor: '#10b981',
  },
  {
    fileName: 'og-about.png',
    badge: 'OUR MISSION & JOURNEY',
    title: 'Built by Shop Owners, for Shop Owners',
    description: 'Born on an active cyber café counter in India to eliminate WhatsApp chaos and counter queues.',
    features: ['🏪 100% India-Focused', '⚡ 24/7 Dedicated Support', '💡 Zero Hardware Upgrade'],
    accentColor: '#8b5cf6',
  },
  {
    fileName: 'og-contact.png',
    badge: '24/7 DEDICATED MERCHANT SUPPORT',
    title: 'Get in Touch with Scan&Print Support Team',
    description: 'Have printer compatibility questions or need onboarding assistance? We are here to help.',
    features: ['💬 Direct WhatsApp Support', '📞 Phone Assistance', '⚡ Priority SLA Response'],
    accentColor: '#06b6d4',
  },
  {
    fileName: 'og-legal.png',
    badge: 'TRUST, COMPLIANCE & PRIVACY',
    title: 'Privacy Policy & 100% Auto-Delete Guarantee',
    description: 'Customer files are permanently deleted immediately after printing. Zero storage or data sharing.',
    features: ['🔒 End-to-End Privacy', '🛡️ Fair Refund Guarantee', '📜 Transparent Terms'],
    accentColor: '#10b981',
  },
  {
    fileName: 'og-register.png',
    badge: 'MERCHANT ONBOARDING',
    title: 'Register Your Shop & Start 48-Hour Free Demo',
    description: 'Automate your counter, accept instant customer payments, and boost your daily printing revenue.',
    features: ['⚡ Instant Account Creation', '🆓 48-Hour Full Trial', '🖨️ Zero Setup Fees'],
    accentColor: '#e11d48',
  },
]

function generateSvgCard({ accentColor = '#e11d48' } = {}) {
  return `
<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0a09"/>
      <stop offset="50%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.32"/>
      <stop offset="70%" stop-color="${accentColor}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="36" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="${accentColor}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- 1:1 Square Background Base -->
  <rect width="1200" height="1200" fill="url(#bgGrad)"/>
  <rect width="1200" height="1200" fill="url(#centerGlow)"/>

  <!-- Subtle Outer Border Frame -->
  <rect x="32" y="32" width="1136" height="1136" rx="44" fill="none" stroke="#292524" stroke-width="2"/>
  <rect x="32" y="32" width="1136" height="1136" rx="44" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.5"/>

  <!-- Centered Logo Card & Brand Group in 1:1 Canvas -->
  <g transform="translate(600, 580)">
    <!-- Main Big White Card for Logo Icon -->
    <rect x="-240" y="-350" width="480" height="480" rx="120" fill="#ffffff" stroke="#f43f5e" stroke-opacity="0.4" stroke-width="6" filter="url(#cardShadow)"/>
    
    <!-- Big Official Logo SVG -->
    <g transform="translate(-190, -300)">
      <svg width="380" height="380" viewBox="205 200 837 861">
        ${logoInnerSvg}
      </svg>
    </g>

    <!-- Scan&Print Brand Name -->
    <text x="0" y="215" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" letter-spacing="-1.5">Scan<tspan fill="#e11d48">&amp;Print</tspan></text>
    <text x="0" y="265" text-anchor="middle" fill="#a8a29e" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" letter-spacing="6">SMART PRINT NETWORK</text>
  </g>
</svg>
`
}

async function run() {
  console.log('🎨 [OG Image Generator]: Rendering 1:1 ratio (1200x1200) Open Graph preview images...')

  for (const card of ogCards) {
    const svgContent = generateSvgCard(card)
    const outputPath = path.resolve(ogOutputDir, card.fileName)

    await sharp(Buffer.from(svgContent))
      .resize(1200, 1200)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(outputPath)

    console.log(`  ✓ Generated 1:1: ${path.relative(projectRoot, outputPath)} (1200x1200)`)
  }

  console.log('✨ [OG Image Generator]: All 1:1 Open Graph images created successfully!')
}

run().catch((err) => {
  console.error('❌ [OG Image Generator Error]:', err)
  process.exit(1)
})
