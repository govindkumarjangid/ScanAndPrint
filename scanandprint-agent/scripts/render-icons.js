import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '../assets')

const mainIconSvg = fs.readFileSync(path.join(assetsDir, 'icon.svg'), 'utf8')

const getTraySvg = (statusColor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Top Paper -->
  <path d="M 18 8 L 46 8 C 48 8 50 10 50 12 L 50 24 L 14 24 L 14 12 C 14 10 16 8 18 8 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <line x1="20" y1="14" x2="44" y2="14" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="20" y1="18" x2="38" y2="18" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Main Printer Body -->
  <rect x="8" y="22" width="48" height="24" rx="6" fill="#F0245C" stroke="#BE123C" stroke-width="1.5"/>
  <!-- Output Slot -->
  <rect x="14" y="34" width="36" height="4" rx="2" fill="#881337"/>

  <!-- Bottom Output Paper -->
  <path d="M 16 36 L 48 36 L 48 52 C 48 54 46 56 44 56 L 20 56 C 18 56 16 54 16 52 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <line x1="20" y1="42" x2="44" y2="42" stroke="#F0245C" stroke-width="2" stroke-linecap="round"/>
  <line x1="20" y1="46" x2="40" y2="46" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Status Badge Dot (Bottom Right) -->
  <circle cx="50" cy="50" r="10" fill="#0F172A" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="50" cy="50" r="7" fill="${statusColor}"/>
</svg>`

async function generateAll() {
  console.log('Rendering SVG assets to pixel-perfect PNGs via Sharp...')

  // 1. App Icon (512x512 PNG)
  await sharp(Buffer.from(mainIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'))
  console.log('✅ assets/icon.png created (512x512 PNG)')

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

  // Default tray-icon.png
  await sharp(Buffer.from(connectedSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'tray-icon.png'))

  console.log('🎉 All icons successfully generated!')
}

generateAll().catch(console.error)

