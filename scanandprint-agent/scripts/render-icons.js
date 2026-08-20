import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '../assets')
const buildDir = path.resolve(__dirname, '../build')

const uploadedIconPath = 'C:/Users/a/.gemini/antigravity/brain/8ddf50be-4852-4652-bd76-90d1dddab213/.user_uploaded/media_1787221757765.png'

async function generateAll() {
  console.log('Generating official Scan&Print app icons from exact uploaded design...')

  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true })

  // 1. High-DPI App Icon (512x512 PNG with subtle luxury rounded border for desktop)
  const baseImg = sharp(uploadedIconPath)

  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(uploadedIconPath)
          .resize(460, 460, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        top: 26,
        left: 26,
      },
    ])
    .png()
    .toBuffer()

  fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon512)
  console.log('✅ assets/icon.png created (512x512 PNG)')

  // 2. Generate Multi-Resolution Windows ICO (256, 128, 64, 48, 32, 16)
  const sizes = [256, 128, 64, 48, 32, 16]
  const pngBuffers = []

  for (const size of sizes) {
    const pad = Math.max(1, Math.round(size * 0.06))
    const innerSize = size - pad * 2

    const innerBuf = await sharp(uploadedIconPath)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    const buf = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: innerBuf, top: pad, left: pad }])
      .png()
      .toBuffer()

    pngBuffers.push({ size, buf })
  }

  // Construct Standard Windows ICO Binary Format
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // Type: 1 = Icon
  header.writeUInt16LE(count, 4)

  const dirEntries = []
  let offset = 6 + 16 * count

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0) // Width (0 = 256)
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1) // Height (0 = 256)
    entry.writeUInt8(0, 2) // Color count
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes
    entry.writeUInt16LE(32, 6) // Bits per pixel (32-bit RGBA)
    entry.writeUInt32LE(item.buf.length, 8) // Data size
    entry.writeUInt32LE(offset, 12) // Data offset
    dirEntries.push(entry)
    offset += item.buf.length
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buf)])

  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer)
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer)
  console.log('✅ assets/icon.ico & build/icon.ico created (' + icoBuffer.length + ' bytes)')

  // 3. Tray Icons (32x32) with high contrast background & status dots
  const trayBase = await sharp(uploadedIconPath)
    .resize(24, 24, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  async function makeTrayIcon(statusColor, filename) {
    const dotSvg = Buffer.from(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="5.5" fill="#09090b" />
        <circle cx="25" cy="25" r="4" fill="${statusColor}" />
      </svg>
    `)

    const canvas = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: trayBase, top: 4, left: 4 },
        { input: dotSvg, top: 0, left: 0 },
      ])
      .png()
      .toBuffer()

    fs.writeFileSync(path.join(assetsDir, filename), canvas)
    console.log(`✅ assets/${filename} created (32x32 PNG)`)
  }

  await makeTrayIcon('#10B981', 'tray-connected.png')
  await makeTrayIcon('#EF4444', 'tray-disconnected.png')
  await makeTrayIcon('#F59E0B', 'tray-unconfigured.png')

  // Clean tray-icon.png
  const plainTray = await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: trayBase, top: 4, left: 4 }])
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), plainTray)

  console.log('🎉 All Scan&Print desktop and tray icons successfully generated!')
}

generateAll().catch(console.error)


