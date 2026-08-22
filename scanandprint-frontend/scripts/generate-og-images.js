import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const ogOutputDir = path.resolve(projectRoot, 'public/images/og')

if (!fs.existsSync(ogOutputDir)) {
  fs.mkdirSync(ogOutputDir, { recursive: true })
}

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
    description: 'Instant QR kiosk, desktop printer agent, multi-printer load balancing, and direct UPI settlements.',
    features: ['📱 Mobile Web Kiosk', '🔄 Live Desktop Agent', '🔒 Zero-Storage Privacy'],
    accentColor: '#3b82f6',
  },
  {
    fileName: 'og-pricing.png',
    badge: 'TRANSPARENT & AFFORDABLE PRICING',
    title: '100% Free 2-Hour Demo & Flexible Shop Plans',
    description: 'Experience unlimited automated printing. Test live with 2-Hour Free Demo or choose Monthly/Yearly.',
    features: ['🎁 Free 2-Hr Full Demo', '🚀 Affordable Monthly ₹1299', '⭐ Yearly 78% Off ₹1799'],
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
    features: ['💬 Direct WhatsApp Support', '📞 Phone Assistance', '⚡ 2-Hour SLA Response'],
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
    title: 'Register Your Shop & Start 2-Hour Free Demo',
    description: 'Automate your counter, accept instant UPI payments, and boost your daily printing revenue.',
    features: ['⚡ Instant Account Creation', '🆓 2-Hour Full Trial', '🖨️ No Setup Fees'],
    accentColor: '#e11d48',
  },
]

function generateSvgCard({ badge, title, description, features, accentColor }) {
  const featurePills = features
    .map(
      (f) => `
    <g>
      <rect rx="12" height="42" width="${f.length * 10 + 40}" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
      <text x="20" y="26" fill="#f5f5f4" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">${escapeXml(f)}</text>
    </g>`
    )
    .join('')

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0a09"/>
      <stop offset="50%" stop-color="#141210"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <radialGradient id="glowTopRight" cx="90%" cy="10%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="10%" cy="90%" r="45%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glowTopRight)"/>
  <rect width="1200" height="630" fill="url(#glowBottomLeft)"/>

  <!-- Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#292524" stroke-width="2"/>
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="${accentColor}" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Logo & Header Brand -->
  <g transform="translate(80, 75)">
    <!-- Logo Icon Box -->
    <rect width="48" height="48" rx="14" fill="${accentColor}"/>
    <path d="M14 14h20v20H14z" fill="none"/>
    <path d="M16 20h16M16 24h16M16 28h10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <text x="64" y="34" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Scan&amp;Print</text>
    <text x="212" y="34" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800">.in</text>
  </g>

  <!-- Domain Top Right -->
  <g transform="translate(930, 85)">
    <rect rx="10" height="34" width="190" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
    <text x="18" y="22" fill="#a8a29e" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">scanandprint.in</text>
  </g>

  <!-- Category Badge -->
  <g transform="translate(80, 160)">
    <rect rx="12" height="34" width="${badge.length * 9.5 + 30}" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.5" stroke-width="1.5"/>
    <text x="16" y="22" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" letter-spacing="1">${escapeXml(badge)}</text>
  </g>

  <!-- Big Headline Title -->
  <g transform="translate(80, 240)">
    ${wrapTextSvg(title, 80, 52, 1040, '#ffffff', 800)}
  </g>

  <!-- Subtitle Description -->
  <g transform="translate(80, 390)">
    ${wrapTextSvg(description, 32, 22, 1040, '#a8a29e', 500)}
  </g>

  <!-- Bottom Feature Badges Bar -->
  <g transform="translate(80, 490)">
    ${renderFeatureBadgesHorizontal(features, accentColor)}
  </g>
</svg>
`
}

function escapeXml(unsafe) {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTextSvg(text, lineHeight, fontSize, maxWidth, fill, fontWeight) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length * (fontSize * 0.55) > maxWidth) {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines
    .slice(0, 2)
    .map(
      (line, i) =>
        `<text x="0" y="${i * lineHeight}" fill="${fill}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="-0.5">${escapeXml(line)}</text>`
    )
    .join('\n')
}

function renderFeatureBadgesHorizontal(features, accentColor) {
  let offsetX = 0
  return features
    .map((feature) => {
      const width = feature.length * 10 + 36
      const svgChunk = `
      <g transform="translate(${offsetX}, 0)">
        <rect rx="12" height="42" width="${width}" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
        <text x="18" y="26" fill="#e7e5e4" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600">${escapeXml(feature)}</text>
      </g>`
      offsetX += width + 16
      return svgChunk
    })
    .join('')
}

async function run() {
  console.log('🎨 [OG Image Generator]: Rendering 1200x630 Open Graph preview images...')

  for (const card of ogCards) {
    const svgContent = generateSvgCard(card)
    const outputPath = path.resolve(ogOutputDir, card.fileName)

    await sharp(Buffer.from(svgContent))
      .resize(1200, 630)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(outputPath)

    console.log(`  ✓ Generated: ${path.relative(projectRoot, outputPath)} (1200x630)`)
  }

  console.log('✨ [OG Image Generator]: All Open Graph images created successfully!')
}

run().catch((err) => {
  console.error('❌ [OG Image Generator Error]:', err)
  process.exit(1)
})
