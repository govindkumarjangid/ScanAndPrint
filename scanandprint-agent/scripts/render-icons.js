import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '../assets')

// Base logo SVG path
const logoSvgPath = path.join(assetsDir, 'icon.svg')
const logoContent = fs.readFileSync(logoSvgPath, 'utf8')

// Function to generate tray SVG with status dot
const getTraySvg = (statusColor) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Rounded Base Background for Tray visibility on light/dark Windows Taskbar -->
  <rect x="2" y="2" width="60" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- Embedded Official Logo -->
  <svg x="6" y="6" width="52" height="52" viewBox="205 200 837 861">
    ${logoContent.replace(/<\/?svg[^>]*>/g, '')}
  </svg>

  <!-- Status Indicator Badge (Bottom Right) -->
  <circle cx="50" cy="50" r="9" fill="#0F172A" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="50" cy="50" r="6.5" fill="${statusColor}"/>
</svg>`

const getAppIconSvg = () => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFF1F4"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#F0245C" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- High-DPI App Icon Rounded Card -->
  <rect x="24" y="24" width="464" height="464" rx="100" fill="url(#bgGrad)" stroke="#F0245C" stroke-width="8" filter="url(#shadow)"/>

  <!-- Official Logo Graphic -->
  <svg x="56" y="56" width="400" height="400" viewBox="205 200 837 861">
    ${logoContent.replace(/<\/?svg[^>]*>/g, '')}
  </svg>
</svg>`

async function generateAll() {
  console.log('Rendering official Scan&Print SVG assets to pixel-perfect PNGs via Sharp...')

  // 1. App Icon (512x512 PNG)
  const appIconSvg = getAppIconSvg()
  fs.writeFileSync(path.join(assetsDir, 'icon-full.svg'), appIconSvg)
  await sharp(Buffer.from(appIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'))
  console.log('✅ assets/icon.png created (512x512 PNG from official logo.svg)')

  // 2. Tray Connected (64x64 PNG)
  const connectedSvg = getTraySvg('#10B981')
  fs.writeFileSync(path.join(assetsDir, 'tray-connected.svg'), connectedSvg)
  await sharp(Buffer.from(connectedSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'tray-connected.png'))
  console.log('✅ assets/tray-connected.png created (64x64 PNG)')

  // 3. Tray Disconnected (64x64 PNG)
  const disconnectedSvg = getTraySvg('#F43F5E')
  fs.writeFileSync(path.join(assetsDir, 'tray-disconnected.svg'), disconnectedSvg)
  await sharp(Buffer.from(disconnectedSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'tray-disconnected.png'))
  console.log('✅ assets/tray-disconnected.png created (64x64 PNG)')

  // 4. Tray Unconfigured (64x64 PNG)
  const unconfiguredSvg = getTraySvg('#F59E0B')
  fs.writeFileSync(path.join(assetsDir, 'tray-unconfigured.svg'), unconfiguredSvg)
  await sharp(Buffer.from(unconfiguredSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'tray-unconfigured.png'))
  console.log('✅ assets/tray-unconfigured.png created (64x64 PNG)')

  // 5. Default tray-icon.png
  await sharp(Buffer.from(connectedSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'tray-icon.png'))

  console.log('🎉 All official Scan&Print icons successfully generated!')
}

generateAll().catch(console.error)

